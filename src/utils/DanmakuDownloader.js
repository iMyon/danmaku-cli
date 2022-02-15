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
const { decodeBv } = require('./BilibiliUtils');

class DanmakuDownloader {
  constructor(config = {}) {
    this.config = {
      basePath: 'output',
      maxConcurrency: 5,
      downloadRelatedSeason: true, // 自动下载相关的season，比如传递奈叶第一季的ss号，会自动下载其他几季的弹幕
      restTime: 2000, // 太快不好，大批量弹幕文件下载时每个连接请求处理完成后休息一会，防被封，单位ms，爬虫建议设置为5000
    };
    Object.assign(this.config, config);
    this.danmakuConverter = new DanmakuConverter();
    this.limit = pLimit(this.config.maxConcurrency);
    this.spinner = ora('').start();
  }

  /**
   *
   * @param bangumiSymbol av124/ss34333
   * @param bangumiName
   * @returns {Promise<void>}
   */
  async download(bangumiSymbol, bangumiName = '') {
    if (bangumiSymbol.startsWith('ep')) {
      const epInfo = await BangumiApi.getEpisode(bangumiSymbol.substr(2));
      await this.download(`ss${epInfo.season_id}`, bangumiName);
      return;
    }
    await FsUtil.mkdirWhenNotExist(this.config.basePath);
    let outputPath = path.join(this.config.basePath, '' + bangumiSymbol + StringUtils.formatFilename(bangumiName));
    let pageList = [];
    if (bangumiSymbol.startsWith('av') || bangumiSymbol.startsWith('BV')) {
      const aid = bangumiSymbol.startsWith('av') ? bangumiSymbol.substr(2) : decodeBv(bangumiSymbol);
      if (!bangumiName) {
        const bangumiDetail = await BangumiApi.getView(aid);
        outputPath += StringUtils.formatFilename(bangumiDetail.title);
      }
      await FsUtil.mkdirWhenNotExist(outputPath);
      const res = await BangumiApi.getPageList(aid);
      if (res === null) {
        console.log(`找不到番剧信息，已跳过[${bangumiSymbol}${bangumiName}]`);
        return;
      }
      pageList = res.data.map(e => {
        return {
          cid: e.cid,
          index: e.page,
          name: e.part,
        };
      });
    } else if (bangumiSymbol.startsWith('ss')) {
      const currentSeasonId = bangumiSymbol.substr(2);
      const res = await BangumiApi.getSeason(currentSeasonId);
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
          await writeFile(path.join(_outputPath, `${filename}.xml`), xmlData);
          await writeFile(path.join(_outputPath, `${filename}.ass`), this.danmakuConverter.convert(xmlData));
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
