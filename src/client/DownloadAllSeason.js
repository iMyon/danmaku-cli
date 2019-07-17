/*
  Created by IntelliJ IDEA.
  User: Myon
  Date: 2019/7/17 21:27
*/

const BangumiApi = require('../api/bangumi');
const DanmukuDownloader = require('../utils/DanmukuDownloader');
const StringUtils = require('../utils/StringUtils');
const downloader = new DanmukuDownloader();

class DownloadAllSeason {
  static async downloadAll() {
    let i = 1;
    // eslint-disable-next-line
    while (true) {
      console.log(i);
      const flag = await this.downloadAPageSeason(i++);
      if (flag === false) break;
      await sleep(64 * 1000);
    }
  }
  static async downloadAPageSeason(page) {
    const bangumiList = await BangumiApi.getBangumiList(page);
    if (bangumiList.result.data.length === 0) return false;
    const promises = [];
    for (let bgm of bangumiList.result.data) {
      promises.push(
        // eslint-disable-next-line
        new Promise(async resolve => {
          await downloader.download(`ss${bgm.season_id}`, StringUtils.formatFilename(bgm.title));
          resolve();
        })
      );
    }
    await Promise.all(promises);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = DownloadAllSeason;
