const DanmukuDownloader = require('../utils/DanmukuDownloader');
module.exports = function download(program) {
  program.command('download [video]').action(async (video, args) => {
    const downloader = new DanmukuDownloader({ basePath: 'output1' });
    await downloader.download(video);
  });
};
