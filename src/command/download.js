const DanmukuDownloader = require('../utils/DanmukuDownloader');
module.exports = function download(program) {
  program
    .command('download <video>')
    .description('下载视频弹幕，支持av/ss/ep形式视频。示例：danmuku download av135433')
    .action(async (video, args) => {
      const downloader = new DanmukuDownloader({ basePath: '' });
      await downloader.download(video);
      process.exit();
    });
};
