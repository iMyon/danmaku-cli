const DanmukuConverter = require('./DanmukuConverter');
const fs = require('fs');
const path = require('path');
const DanmukuApi = require('../api/danmuku');
const BangumiApi = require('../api/bangumi');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

class DanmukuDownloader {
  constructor(config = {}) {
    this.config = {};
    Object.assign(this.config, config);
    this.danmukuConverter = new DanmukuConverter();
    this.basePath = 'output';
  }
  async download(aid) {
    if (!(await exists(this.basePath))) {
      await mkdir(this.basePath);
    }
    const pageList = await BangumiApi.getPageList(aid);
    const outputPath = path.join(this.basePath, '' + aid);
    if (!(await exists(outputPath))) {
      await mkdir(outputPath);
    }
    const downloadPromiseList = [];
    for (let part of pageList) {
      downloadPromiseList.push(
        // eslint-disable-next-line
        new Promise(async resolve => {
          const xmlData = await DanmukuApi.getXml(part.cid);
          await writeFile(path.join(outputPath, `${part.page}.xml`), xmlData);
          await writeFile(path.join(outputPath, `${part.page}.ass`), this.danmukuConverter.convert(xmlData));
          resolve();
        })
      );
    }
    await Promise.all(downloadPromiseList);
  }
}

module.exports = DanmukuDownloader;
