/*
  Created by IntelliJ IDEA.
  User: Myon
  Date: 2019/7/17 21:27
*/

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { promisify } from 'util';
import BangumiApi from '../api/bangumi';
import BaseCrawler from './BaseCrawler';
import StringUtils from '../utils/StringUtils';
import FsUtil from '../utils/FsUtil';

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
    if (bangumiList.data.archives === null) {
      console.log(chalk.green('下载完成'));
      process.exit();
    }
    const promises = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const bgm of bangumiList.data.archives) {
      if (this.config.ignore.some((f) => bgm.title.match(f))) {
        // eslint-disable-next-line no-continue
        continue;
      }
      let bangumiSymbol = `av${bgm.aid}`;
      if (bgm.redirect_url) {
        // 重定向到ss或ep的番剧需要变更处理方式
        bangumiSymbol = bgm.redirect_url.replace(/\/$/, '').split('/').pop();
      }
      promises.push(this.downloader.download(bangumiSymbol, StringUtils.formatFilename(bgm.title)));
    }
    return new Promise((resolve, reject) => {
      Promise.all(promises)
        .then(() => {
          resolve();
        })
        .catch((e) => {
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

export default FinishBangumiDownloader;
