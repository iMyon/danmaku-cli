const DanmukuDownloader = require('../utils/DanmukuDownloader');
module.exports = function download(program) {
  program
    .command('download <video>')
    .description('example：download av135433/download ss1535/download ep276626')
    .action(async (video, args) => {
      const downloader = new DanmukuDownloader({ basePath: '' });
      await downloader.download(video);
      process.exit();
    });
};
