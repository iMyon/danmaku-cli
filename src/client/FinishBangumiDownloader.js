/*
  Created by IntelliJ IDEA.
  User: Myon
  Date: 2019/7/17 21:27
*/

const BangumiApi = require('../api/bangumi');
const BaseCrawler = require('./BaseCrawler');
const StringUtils = require('../utils/StringUtils');
const fs = require('fs');
const logger = fs.createWriteStream('log.txt', {
  flags: 'a', // 'a' means appending (old data will be preserved)
});

class FinishBangumiDownloader extends BaseCrawler {
  constructor(config = {}) {
    super(config);
  }
  async downloadAPage(page) {
    const bangumiList = await BangumiApi.getNewList({ pn: page, ps: this.config.pageSize });
    if (bangumiList.data.archives.length === 0) return true;
    const promises = [];
    for (let bgm of bangumiList.data.archives) {
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
            logger.write(`[error] ${e.config.url}`);
            resolve();
          } else {
            reject(e);
          }
        });
    });
  }
}

module.exports = FinishBangumiDownloader;
