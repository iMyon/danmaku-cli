const DanmukuConverter = require('./DanmukuConverter');
const fs = require('fs');
const path = require('path');
const DanmukuApi = require('../api/danmuku');
const BangumiApi = require('../api/bangumi');
const StringUtils = require('./StringUtils');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const pLimit = require('p-limit');
const ora = require('ora');
const chalk = require('chalk');
const FsUtil = require('./FsUtil');

class DanmukuDownloader {
  constructor(config = {}) {
    this.config = {
      basePath: 'output',
      maxConcurrency: 5,
      downloadRelatedSeason: true, // 自动下载相关的season，比如传递奈叶第一季的ss号，会自动下载其他几季的弹幕
    };
    Object.assign(this.config, config);
    this.danmukuConverter = new DanmukuConverter();
    this.limit = pLimit(this.config.maxConcurrency);
    this.spinner = ora('').start();
  }

  /**
   *
   * @param bangumiSymbol av124/ss34333
   * @returns {Promise<void>}
   */
  async download(bangumiSymbol, bangumiName = '') {
    await FsUtil.mkdirWhenNotExist(this.config.basePath);
    let outputPath = path.join(this.config.basePath, '' + bangumiSymbol + StringUtils.formatFilename(bangumiName));
    let pageList = [];
    if (bangumiSymbol.startsWith('av')) {
      if (!bangumiName) {
        const bangumiDetail = await BangumiApi.getView(bangumiSymbol.substr(2));
        outputPath += StringUtils.formatFilename(bangumiDetail.title);
      }
      await FsUtil.mkdirWhenNotExist(outputPath);
      const res = await BangumiApi.getPageList(bangumiSymbol.substr(2));
      pageList = res.map(e => {
        return {
          cid: e.cid,
          index: e.page,
          name: e.pagename,
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
        this.limit(
          () =>
            new Promise(async resolve => {
              let _outputPath = outputPath;
              if (part.season_title) {
                _outputPath = path.join(_outputPath, part.season_title);
              }
              const xmlData = await DanmukuApi.getXml(part.cid);
              let filename = part.index;
              if (part.name) {
                filename += `.${StringUtils.formatFilename(part.name)}`;
              }
              await writeFile(path.join(_outputPath, `${filename}.xml`), xmlData);
              await writeFile(path.join(_outputPath, `${filename}.ass`), this.danmukuConverter.convert(xmlData));
              this.spinner.text = `pending: ${this.limit.pendingCount}`;
              resolve();
            })
        )
      );
    }
    const currentSpiner = ora(chalk.blue(`${bangumiSymbol}${bangumiName}`)).start();
    await Promise.all(downloadPromiseList);
    currentSpiner.succeed(chalk.green(`${bangumiSymbol}${bangumiName}`));
  }
}

module.exports = DanmukuDownloader;
