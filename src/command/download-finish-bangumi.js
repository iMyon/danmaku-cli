const FinishBangumiDownloader = require('../client/FinishBangumiDownloader');
module.exports = function downloadFinishBangumi(program) {
  program
    .command('download-finish-bangumi')
    .description('下载全部已完结动画弹幕')
    .option('-n, --page-size <number>', '分页大小', 10)
    .option('-s, --start-page <number>', '下载开始页', 1)
    .option('--stop-page <number>', '下载结束页')
    .option('--sleep-time <number>', '每页下载完成等待时间（ms），不建议设置太小，造成服务器压力可能被封IP', 60000)
    .option('--max-concurrency <number>', '弹幕文件最大同时下载数，不建议设置太大，同上', 5)
    .option('-o, --output-path <string>', '输出目录', 'output')
    .action(async args => {
      let config = {};
      if (args.startPage) config.startPage = args.startPage;
      if (args.stopPage) config.stopPage = args.stopPage;
      if (args.pageSize) config.pageSize = args.pageSize;
      if (args.sleepTime) config.sleepTime = args.sleepTime;
      if (args.maxConcurrency) config.maxConcurrency = args.maxConcurrency;
      if (args.outputPath) config.outputPath = args.outputPath;
      const downloader = new FinishBangumiDownloader(config);
      await downloader.download();
    });
};
