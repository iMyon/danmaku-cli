/*
  Created by IntelliJ IDEA.
  User: Myon
  Date: 2019/7/17 21:27
*/

const BangumiApi = require('../api/bangumi');
const BaseCrawler = require('./BaseCrawler');
const StringUtils = require('../utils/StringUtils');
const fs = require('fs');
const path = require('path');
const FsUtil = require('../utils/FsUtil');
const { promisify } = require('util');
const logger = fs.createWriteStream('log.txt', {
  flags: 'a', // 'a' means appending (old data will be preserved)
});

class FinishBangumiDownloader extends BaseCrawler {
  constructor(config = {}) {
    super(config);
    this.config.ignore = ['【合集】哆啦A梦'];
  }
  async downloadAPage(page) {
    const bangumiList = await BangumiApi.getNewList({ pn: page, ps: this.config.pageSize });
    await FsUtil.mkdirWhenNotExist('raw');
    await promisify(fs.writeFile)(
      path.join('raw', `bgm-list-size${this.config.pageSize}-page${page}.json`),
      JSON.stringify(bangumiList, null, 2)
    );
    if (bangumiList.data.archives.length === 0) return true;
    const promises = [];
    for (let bgm of bangumiList.data.archives) {
      if (this.config.ignore.some(f => bgm.title.match(f))) {
        continue;
      }
      let bangumiSymbol = `av${bgm.aid}`;
      if (bgm.redirect_url) {
        // 重定向到ss或ep的番剧需要变更处理方式
        bangumiSymbol = bgm.redirect_url
          .replace(/\/$/, '')
          .split('/')
          .pop();
      }
      promises.push(this.downloader.download(bangumiSymbol, StringUtils.formatFilename(bgm.title)));
    }
    return new Promise((resolve, reject) => {
      Promise.all(promises)
        .then(() => {
          resolve();
        })
        .catch(e => {
          if (e.response && e.response.status === 404) {
            logger.write(`[error] ${e.config.url} \r\n`);
            resolve();
          } else {
            reject(e);
          }
        });
    });
  }
}

module.exports = FinishBangumiDownloader;
