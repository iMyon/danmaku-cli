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
    const videoDetail = await BangumiApi.getView(aid);
    const outputPath = path.join(this.basePath, '' + aid);
    if (!(await exists(outputPath))) {
      await mkdir(outputPath);
    }
    for (let part of videoDetail.list) {
      const xmlData = await DanmukuApi.getXml(part.cid);
      await writeFile(path.join(outputPath, `${part.part}.xml`), xmlData);
      await writeFile(path.join(outputPath, `${part.part}.ass`), this.danmukuConverter.convert(xmlData));
    }
  }
}

module.exports = DanmukuDownloader;
