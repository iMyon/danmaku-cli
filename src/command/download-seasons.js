const SeasonsDownloader = require('../client/SeasonsDownloader');
module.exports = function downloadSeasons(program) {
  program
    .command('download-seasons')
    .alias('dls')
    .description('下载全部日本地区索引番剧弹幕（ss地址番剧）')
    .option('-n, --page-size <number>', '分页大小', 10)
    .option('-s, --start-page <number>', '下载开始页', 1)
    .option('--stop-page <number>', '下载结束页')
    .option('--sleep-time <number>', '每页下载完成等待时间（ms），不建议设置太小，造成服务器压力可能被封IP', 60000)
    .option('--max-concurrency <number>', '弹幕文件下载最大并发数，不建议设置太大，同上', 5)
    .option('--rest-time <number>', '每个下载连接请求处理完成后休息一会，单位ms', 1000)
    .option('-o, --output-path <string>', '输出目录', 'output')
    .action(async args => {
      let config = {};
      if (args.startPage) config.startPage = args.startPage;
      if (args.stopPage) config.stopPage = args.stopPage;
      if (args.pageSize) config.pageSize = args.pageSize;
      if (args.sleepTime) config.sleepTime = args.sleepTime;
      if (args.restTime) config.restTime = args.restTime;
      if (args.maxConcurrency) config.maxConcurrency = args.maxConcurrency;
      if (args.outputPath) config.outputPath = args.outputPath;
      const seasonsDownloader = new SeasonsDownloader(config);
      await seasonsDownloader.download();
    });
};
