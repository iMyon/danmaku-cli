/*
  Created by IntelliJ IDEA.
  User: Myon
  Date: 2019/7/17 21:27
*/

const BangumiApi = require('../api/bangumi');
const DanmukuDownloader = require('../utils/DanmukuDownloader');
const StringUtils = require('../utils/StringUtils');
const FsUtil = require('../utils/FsUtil');
const ora = require('ora');
const chalk = require('chalk');

class SeasonsDownloader {
  constructor(config = {}) {
    this.config = {
      startPage: 1,
      pageSize: 10,
      sleepTime: 64 * 1000, // ms
      outputPath: 'output',
    };
    Object.assign(this.config, config);
    this.downloader = new DanmukuDownloader({ basePath: this.config.outputPath, downloadRelatedSeason: false });
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
          this.downloader.spinner.start();
          flag = await this.downloadAPageSeason(i, this.config.pageSize);
          this.downloader.spinner.succeed(chalk.green(`第${i}页下载完成`));
          let waitingSeconds = this.config.sleepTime / 1000;
          const spinner = ora(`waiting for next page: ${waitingSeconds}s`).start();
          const ticker = setInterval(() => {
            spinner.text = `waiting for next page: ${--waitingSeconds}s`;
          }, 1000);
          await sleep(this.config.sleepTime);
          spinner.stop();
          clearInterval(ticker);
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
