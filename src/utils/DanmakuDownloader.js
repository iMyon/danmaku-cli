const eventManager = require('../eventManager/EventManager');

const DanmakuConverter = require('./DanmakuConverter');
const fs = require('fs');
const path = require('path');
const DanmakuApi = require('../api/danmaku');
const BangumiApi = require('../api/bangumi');
const StringUtils = require('./StringUtils');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const pLimit = require('p-limit');
const ora = require('ora');
const chalk = require('chalk');
const FsUtil = require('./FsUtil');

class DanmakuDownloader {
  constructor(config = { downloadRelatedSeason: true }) {
    this.config = {
      basePath: 'output',
      maxConcurrency: 5,
      downloadRelatedSeason: config.downloadRelatedSeason, // 自动下载相关的season，比如传递奈叶第一季的ss号，会自动下载其他几季的弹幕
      restTime: 100, // 太快不好，大批量弹幕文件下载时每个连接请求处理完成后休息一会，防被封，单位ms，爬虫建议设置为1000
    };
    Object.assign(this.config, config);
    this.danmakuConverter = new DanmakuConverter();
    this.limit = pLimit(this.config.maxConcurrency);
    this.spinner = ora('').start();
  }

  downloadedVid = new Set();

  /**
   *
   * @param bangumiSymbol av124/ss34333
   * @param bangumiName
   * @returns {Promise<void>}
   */
  async download(bangumiSymbol, bangumiName = '') {
    // 避免重复下载
    if (this.downloadedVid.has(bangumiSymbol)) return;
    this.downloadedVid.add(bangumiSymbol);
    if (bangumiSymbol.startsWith('ep')) {
      const epInfo = await BangumiApi.getEpisode(bangumiSymbol.substr(2));
      await this.download(`ss${epInfo.season_id}`, bangumiName);
      return;
    }
    await FsUtil.mkdirWhenNotExist(this.config.basePath);
    let outputPath = path.join(this.config.basePath, '' + bangumiSymbol + StringUtils.formatFilename(bangumiName));
    let pageList = [];
    if (bangumiSymbol.startsWith('av')) {
      let bangumiDetail;
      if (!bangumiName) {
        bangumiDetail = await BangumiApi.getView(bangumiSymbol.substr(2));
        outputPath += StringUtils.formatFilename(bangumiDetail.title);
      }
      await FsUtil.mkdirWhenNotExist(outputPath);
      const res = await BangumiApi.getPageList(bangumiSymbol.substr(2));
      if (res === null) {
        console.log(`找不到番剧信息，已跳过[${bangumiSymbol}${bangumiName}]`);
        return;
      }
      pageList = res.map(e => {
        return {
          cid: e.cid,
          index: e.page,
          name: e.pagename,
        };
      });
      eventManager.emit('av', bangumiSymbol, bangumiDetail, res);
    } else if (bangumiSymbol.startsWith('ss')) {
      const currentSeasonId = bangumiSymbol.substr(2);
      const res = await BangumiApi.getSeason(currentSeasonId);
      eventManager.emit('season', bangumiSymbol, res);
      if (!bangumiName) {
        outputPath += StringUtils.formatFilename(res.result.series_title);
      }
      await FsUtil.mkdirWhenNotExist(outputPath);
      const seasonTitle = StringUtils.formatFilename(res.result.season_title);
      await FsUtil.mkdirWhenNotExist(path.join(outputPath, seasonTitle));
      res.result.episodes.forEach(e => (e.season_title = seasonTitle));
      const episodes = res.result.episodes;
      if (this.config.downloadRelatedSeason) {
        // 下载关联season
        const seasonIds = res.result.seasons.map(e => e.season_id).filter(e => e + '' !== currentSeasonId);
        for (let seasonId of seasonIds) {
          const res = await BangumiApi.getSeason(seasonId);
          eventManager.emit('season', bangumiSymbol, res);
          const seasonTitle = StringUtils.formatFilename(res.result.season_title);
          await FsUtil.mkdirWhenNotExist(path.join(outputPath, seasonTitle));
          res.result.episodes.forEach(e => (e.season_title = seasonTitle));
          episodes.push(...res.result.episodes);
        }
      }
      pageList = episodes.map(e => {
        return {
          season_title: e.season_title,
          cid: e.cid,
          index: e.index,
          name: e.index_title,
        };
      });
    } else {
      return Promise.reject('找不到匹配的解析规则' + bangumiSymbol);
    }
    const downloadPromiseList = [];
    for (let part of pageList) {
      downloadPromiseList.push(
        this.limit(async () => {
          let _outputPath = outputPath;
          if (part.season_title) {
            _outputPath = path.join(_outputPath, part.season_title);
          }
          const xmlData = await DanmakuApi.getXml(part.cid);
          let filename = part.index;
          if (part.name) {
            filename += `.${StringUtils.formatFilename(part.name)}`;
          }
          const assData = this.danmakuConverter.convert(xmlData);
          await writeFile(path.join(_outputPath, `${filename}.xml`), xmlData);
          await writeFile(path.join(_outputPath, `${filename}.ass`), assData);
          eventManager.emit('comment', part.cid, bangumiSymbol, xmlData, assData);
          this.spinner.text = `pending: ${this.limit.pendingCount}`;
          await sleep(this.config.restTime);
        })
      );
    }
    const currentSpiner = ora(chalk.blue(`${bangumiSymbol}${bangumiName}`)).start();
    await Promise.all(downloadPromiseList);
    currentSpiner.succeed(chalk.green(`${bangumiSymbol}${bangumiName}`));
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = DanmakuDownloader;
