const SeasonsDownloader = require('../client/SeasonsDownloader');
module.exports = function downloadSeasons(program) {
  program
    .command('download-seasons')
    .option('-n, --page-size <number>', 'page size of season list api')
    .option('-s, --start-page <number>', 'start page number of season list api')
    .action(async args => {
      let config = { startPage: args.startPage, pageSize: args.pageSize };
      const seasonsDownloader = new SeasonsDownloader(config);
      await seasonsDownloader.download();
    });
};
