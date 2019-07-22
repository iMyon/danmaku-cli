/*
  Created by IntelliJ IDEA.
  User: Myon
  Date: 2019/7/17 21:27
*/

const BangumiApi = require('../api/bangumi');
const DanmukuDownloader = require('../utils/DanmukuDownloader');
const StringUtils = require('../utils/StringUtils');
const FsUtil = require('../utils/FsUtil');

class SeasonsDownloader {
  constructor(config = {}) {
    this.config = {
      startPage: 1,
      pageSize: 10,
      sleepTime: 64 * 1000, // ms
      outputPath: 'output',
    };
    Object.assign(this.config, config);
    this.downloader = new DanmukuDownloader({ basePath: this.config.outputPath });
  }
  async download() {
    await FsUtil.mkdirWhenNotExist(this.downloader.config.basePath);
    let i = this.config.startPage;
    // eslint-disable-next-line
    while (true) {
      console.log(`第${i}页`);
      let flag;
      let retryTimes = 5; // 重试次数
      while (retryTimes--) {
        try {
          flag = await this.downloadAPageSeason(i, this.config.pageSize);
          await sleep(this.config.sleepTime);
          break;
        } catch (e) {
          console.error(`第${i}页下载失败，正在重试，剩余重试次数${retryTimes}`);
        }
      }
      if (retryTimes <= 0) {
        console.error(`下载失败，当前页数${i}`);
        process.exit(9);
        break;
      }
      if (flag === true) break;
      i++;
    }
  }
  async downloadAPageSeason(page) {
    const bangumiList = await BangumiApi.getBangumiList({ page, pageSize: this.config.pageSize });
    if (bangumiList.result.data.length === 0) return true;
    const promises = [];
    for (let bgm of bangumiList.result.data) {
      promises.push(
        // eslint-disable-next-line
        new Promise(async resolve => {
          await this.downloader.download(`ss${bgm.season_id}`, StringUtils.formatFilename(bgm.title));
          resolve();
        })
      );
    }
    return new Promise((resolve, reject) => {
      Promise.all(promises)
        .then(() => {
          resolve();
        })
        .catch(e => {
          reject(e);
        });
    });
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = SeasonsDownloader;
