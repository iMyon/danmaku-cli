const DanmukuConverter = require('../utils/DanmukuConverter');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const exists = promisify(fs.exists);
const readdir = promisify(fs.readdir);
module.exports = function convert(program) {
  program
    .command('convert')
    .option('-f, --file <string>', '需要转换的xml文件')
    .option('--folder <string>', '需要处理的文件夹（文件和文件夹二选一）')
    .option('--match', '文件名匹配规则', '.xml$')
    .option('--play-res-x <number>', '分辨率宽', 1920)
    .option('--play-res-y <number>', '分辨率高', 1080)
    .option('--font <string>', '字体', '微软雅黑')
    .option('--bold <boolean>', '是否粗体', true)
    .option(
      '--accurate-danmuku-width <boolean>',
      '提升弹幕宽度精准度，滚动弹幕排版更合理，但是非常影响处理效率，建议处理少量弹幕转换时开启',
      false
    )
    .option('--font-size <number>', '字体大小', 40)
    .option('--line-limit <number>', '最大弹幕行数', 50)
    .option('--speed <number>', '驻留时间（s）', 12)
    .option('--alpha <number>', '透明度0-255', 140)
    .action(async args => {
      if (!args.file && !args.folder) {
        console.error('未指定文件');
        return;
      }
      const converter = new DanmukuConverter({
        PlayResX: args.playResX,
        PlayResY: args.playResY,
        font: args.font,
        bold: args.bold,
        fontSize: args.fontSize,
        lineLimit: args.lineLimit,
        speed: args.speed,
        alpha: args.alpha,
        accurateDanmukuWidth: args.accurateDanmukuWidth,
      });
      if (args.file) {
        if (await exists(args.file)) {
          const xmlContent = await readFile(args.file);
          const danmukuStr = converter.convert(xmlContent);
          const filename = args.file.replace('.xml', '.ass');
          await writeFile(filename, danmukuStr);
          console.log(`output: ${filename}`);
        } else {
          console.error('文件不存在');
        }
      } else if (args.folder) {
        if (await exists(args.folder)) {
          // TODO 文件夹处理
          const files = await fs.readdir(args.folder);
          for (let file of files) {
            console.log(file);
          }
        } else {
          console.error('文件夹不存在');
        }
      }
      process.exit();
    });
};
