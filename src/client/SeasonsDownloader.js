/*
  Created by IntelliJ IDEA.
  User: Myon
  Date: 2019/7/17 21:27
*/

import BangumiApi from '../api/bangumi';
import BaseCrawler from './BaseCrawler';
import StringUtils from '../utils/StringUtils';

class SeasonsDownloader extends BaseCrawler {
  constructor(config = {}) {
    super(config);
  }

  async downloadAPage(page) {
    const bangumiList = await BangumiApi.getBangumiList({ page, pagesize: this.config.pageSize });
    if (bangumiList.result.data.length === 0) return true;
    const promises = [];
    bangumiList.result.data.forEach((bgm) => {
      promises.push(this.downloader.download(`ss${bgm.season_id}`, StringUtils.formatFilename(bgm.title)));
    });
    return new Promise((resolve, reject) => {
      Promise.all(promises)
        .then(() => {
          resolve();
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
}

export default SeasonsDownloader;
