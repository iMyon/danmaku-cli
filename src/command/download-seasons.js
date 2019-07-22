const SeasonsDownloader = require('../client/SeasonsDownloader');
module.exports = function downloadSeasons(program) {
  program
    .command('download-seasons')
    .option('-n, --page-size <number>', 'page size of season list api, default: 10')
    .option('-s, --start-page <number>', 'start page number of season list api, default: 1')
    .option('--sleep-time <number>', '')
    .option('--max-concurrency <number>', 'max concurrency of download danmuku file，default: 5')
    .option('-o, --output-path <string>', '')
    .action(async args => {
      let config = {};
      if (args.startPage) config.startPage = args.startPage;
      if (args.pageSize) config.pageSize = args.pageSize;
      if (args.sleepTime) config.sleepTime = args.sleepTime;
      if (args.maxConcurrency) config.maxConcurrency = args.maxConcurrency;
      if (args.outputPath) config.outputPath = args.outputPath;
      const seasonsDownloader = new SeasonsDownloader(config);
      await seasonsDownloader.download();
    });
};
