import ora from 'ora';
import DanmakuDownloader from '../utils/DanmakuDownloader';
import FsUtil from '../utils/FsUtil';

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class BaseCrawler {
  constructor(config = {}) {
    this.config = {
      startPage: 1,
      stopPage: Infinity,
      pageSize: 10,
      sleepTime: 64 * 1000, // ms
      outputPath: 'output',
    };
    Object.assign(this.config, config);
    this.downloader = new DanmakuDownloader({
      basePath: this.config.outputPath,
      downloadRelatedSeason: false,
      restTime: this.config.restTime,
    });
  }

  async download() {
    await FsUtil.mkdirWhenNotExist(this.downloader.config.basePath);
    let i = this.config.startPage;
    // eslint-disable-next-line
    while (true) {
      console.log(`第${i}页`);
      let flag;
      let retryTimes = 5; // 重试次数
      while (retryTimes) {
        try {
          this.downloader.spinner.start();
          // eslint-disable-next-line no-await-in-loop
          flag = await this.downloadAPage(i);
          this.downloader.spinner.stop();
          break;
        } catch (e) {
          console.error(`第${i}页下载失败，正在重试，剩余重试次数${retryTimes}`);
        }
        retryTimes -= 1;
      }
      if (retryTimes <= 0) {
        console.error(`下载失败，当前页数${i}`);
        process.exit(9);
        break;
      }
      if (flag === true) break;
      if (i >= this.config.stopPage) break;
      let waitingSeconds = this.config.sleepTime / 1000;
      const spinner = ora(`waiting for next page: ${waitingSeconds}s`).start();
      const ticker = setInterval(() => {
        waitingSeconds -= 1;
        spinner.text = `waiting for next page: ${waitingSeconds}s`;
      }, 1000);
      // eslint-disable-next-line no-await-in-loop
      await sleep(this.config.sleepTime);
      spinner.stop();
      clearInterval(ticker);
      i += 1;
    }
  }

  // eslint-disable-next-line
  async downloadAPage(page) {}
}

export default BaseCrawler;
