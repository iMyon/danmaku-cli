const DanmakuDownloader = require('../utils/DanmakuDownloader');
export default function download(program) {
  program
    .command('download <video>')
    .alias('dl')
    .description('下载视频弹幕，支持av/ss/ep形式视频。示例：danmaku download av135433')
    .action(async (video, args) => {
      const downloader = new DanmakuDownloader({ basePath: '' });
      await downloader.download(video);
      process.exit();
    });
}
