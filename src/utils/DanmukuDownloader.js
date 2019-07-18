const DanmukuConverter = require('./DanmukuConverter');
const fs = require('fs');
const path = require('path');
const DanmukuApi = require('../api/danmuku');
const BangumiApi = require('../api/bangumi');
const StringUtils = require('./StringUtils');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

class DanmukuDownloader {
  constructor(config = {}) {
    this.config = { basePath: 'output' };
    Object.assign(this.config, config);
    this.danmukuConverter = new DanmukuConverter();
  }

  /**
   *
   * @param bangumiSymbol av124/ss34333
   * @returns {Promise<void>}
   */
  async download(bangumiSymbol, bangumiName = '') {
    await mkdirWhenNotExist(this.config.basePath);
    let outputPath = path.join(this.config.basePath, '' + bangumiSymbol + bangumiName);
    let pageList = [];
    if (bangumiSymbol.startsWith('av')) {
      if (!bangumiName) {
        const bangumiDetail = await BangumiApi.getView(bangumiSymbol.substr(2));
        outputPath += StringUtils.formatFilename(bangumiDetail.title);
      }
      await mkdirWhenNotExist(outputPath);
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
      await mkdirWhenNotExist(outputPath);
      await mkdirWhenNotExist(path.join(outputPath, res.result.season_title));
      const seasonIds = res.result.seasons.map(e => e.season_id).filter(e => e + '' !== currentSeasonId);
      res.result.episodes.forEach(e => (e.season_title = res.result.season_title));
      const episodes = res.result.episodes;
      for (let seasonId of seasonIds) {
        const res = await BangumiApi.getSeason(seasonId);
        await mkdirWhenNotExist(path.join(outputPath, res.result.season_title));
        res.result.episodes.forEach(e => (e.season_title = res.result.season_title));
        episodes.push(...res.result.episodes);
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
        // eslint-disable-next-line
        new Promise(async resolve => {
          let _outputPath = outputPath;
          if (part.season_title) {
            _outputPath = path.join(_outputPath, part.season_title);
          }
          const xmlData = await DanmukuApi.getXml(part.cid);
          await writeFile(path.join(_outputPath, `${part.index}.xml`), xmlData);
          await writeFile(path.join(_outputPath, `${part.index}.ass`), this.danmukuConverter.convert(xmlData));
          resolve();
        })
      );
    }
    await Promise.all(downloadPromiseList);
    console.log(`${bangumiSymbol}${bangumiName} 下载完成`);
  }
}

async function mkdirWhenNotExist(path) {
  if (!(await exists(path))) {
    await mkdir(path);
  }
}

module.exports = DanmukuDownloader;
