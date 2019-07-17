const XmlJs = require('xml-js');
const { createCanvas } = require('canvas');
const canvas = createCanvas(200, 200);
const canvasContext = canvas.getContext('2d'); // 用于计算一条弹幕实际占用像素宽度

class DanmukuConverter {
  constructor(config = {}) {
    this.config = {
      PlayResX: 1920, // 分辨率 宽
      PlayResY: 1080, // 分辨率 高
      font: '微软雅黑', // 字体
      bold: true, // 是否加粗
      fontSize: 30, // 字体大小
      lineCount: 50, // 弹幕最大行数
      speed: 12, // 滚动弹幕驻留时间（秒），越小越快
      fixedSpeed: 4, // 顶端/底部弹幕驻留时间（秒），越小越快
      alpha: 140, // 弹幕透明度,256为全透明，0为不透明
    };
    Object.assign(this.config, config);
    let alpha16 = this.config.alpha.toString(16);
    this.config.alpha = prefixInteger(alpha16, 2);
    if (this.config.fontSize * this.config.lineCount > this.config.PlayResY) {
      this.config.lineCount = ~~(this.config.PlayResY / this.config.fontSize);
    }
    canvasContext.font = `${this.config.fontSize}px ${this.config.font}`;
  }
  convert(xmlString) {
    const xmlJson = XmlJs.xml2js(xmlString, { compact: true });
    const dElements = xmlJson.i.d;

    let danmukuHeader = `\ufeff[Script Info]
ScriptType: v4.00+
Collisions: Normal
PlayResX: ${this.config.PlayResX}
PlayResY: ${this.config.PlayResY}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,微软雅黑,54,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0.00,0.00,1,1,0,2,20,20,120,0"
Style: Danmaku,${this.config.font},${this.config.fontSize},&H${this.config.alpha}FFFFFF,&H${
      this.config.alpha
    }FFFFFF,&H${this.config.alpha}000000,&H${this.config.alpha}000000,${~~this.config
      .bold},0,0,0,100,100,0.00,0.00,1,1,0,2,20,20,20,0`;

    let eventsString = `[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;

    // 保存lineCount大小的数组
    // 每个元素保存最后一次出现在行数下标+1的dsArray元素
    // lineRecords[type][dsaArray[num]] type:0 滚动 1 顶部 2底部
    const lineRecords = [Array(this.config.lineCount), Array(this.config.lineCount), Array(this.config.lineCount)];

    for (let i = 0; i < dElements.length; i++) {
      const dElement = dElements[i];
      const danmukuPosition = dElement._attributes.p.split(',').map(e => {
        return parseInt(e);
      });
      const danmukuText = dElement._text;
      const text = danmukuText;
      let layer = -3;
      let type = 1;
      const start = ~~danmukuPosition[0];
      let end = start + this.config.speed;
      let move1 = this.config.PlayResX + (text.length * this.config.fontSize) / 2;
      let move24 = this.config.fontSize;
      const move3 = 0 - (text.length * this.config.fontSize) / 2;
      const color = prefixInteger((~~danmukuPosition[3]).toString(16), 6).replace(/(.{2})(.{2})(.{2})/, '$3$2$1');

      // 获取字幕插入的行
      let line = this.getDanmukuFitLine({ danmukuPosition, danmukuText }, lineRecords, ~~danmukuPosition[1]);
      // 抛弃超出范围的弹幕
      if (line === Infinity) continue;

      line++; // 数组下标+1

      // 移动弹幕处理
      if (danmukuPosition[1] < 4) {
        move24 = move24 * line;
      }
      // 固定弹幕处理
      else if (danmukuPosition[1] === 4 || danmukuPosition[1] === 5) {
        type = 2;
        layer = -2; // 字幕置于稍高层
        move1 = this.config.PlayResX / 2;
        end = start + this.config.fixedSpeed;
        // 底部弹幕处理
        if (danmukuPosition[1] === 4) {
          move24 = this.config.PlayResY - (line - 1) * this.config.fontSize;
        }
        // 顶部弹幕处理
        if (danmukuPosition[1] === 5) {
          move24 = line * this.config.fontSize;
        }
      }
      // 高级弹幕，告辞
      else {
        continue;
      }
      const ef = type === 1 ? `\\move(" +  + "${move1}, ${move24}, ${move3}, ${move24})` : `\\pos(${move1}, ${move24})`;
      const eventString = `Dialogue: ${layer},${formatTime(start)},${formatTime(
        end
      )},Danmaku,,0000,0000,0000,,{${ef}\\c&H${color}${text}`;
      eventsString = eventsString + eventString + '\n';
    }
    return `${danmukuHeader}\n${eventsString}`;
  }

  /**
   * 获取弹幕应该放置的行数（防重叠）
   * @param danmukuPosition
   * @param danmukuText
   * @param lineRecords
   * @param type 弹幕类型 1-3滚动 4底部 5顶部
   * @returns {number}
   */
  getDanmukuFitLine({ danmukuPosition, danmukuText }, lineRecords, type) {
    let start = parseFloat(danmukuPosition[0]);
    // 滚动弹幕
    if (type <= 3) {
      for (let i = 0; i < lineRecords[0].length; i++) {
        if (lineRecords[0][i] === undefined) {
          lineRecords[0][i] = { danmukuPosition, danmukuText };
          return i;
        }
        let pStart = parseFloat(lineRecords[0][i].danmukuPosition[0]);
        // 使用canvas计算弹幕，缺点：速度慢
        let danmakuWidth = canvasContext.measureText(lineRecords[0][i].danmukuText).width;
        // let danmakuWidth = lineRecords[0][i].danmukuText.length * this.config.fontSize;
        // console.log(lineRecords[0][i].danmukuText, danmakuWidth)

        // 待比较弹幕首次完全显示在屏幕的时间
        let time1 = pStart + (this.config.speed * danmakuWidth) / (this.config.PlayResX + danmakuWidth);
        // 待比较弹幕完全消失在屏幕的时间
        let time2 = pStart + this.config.speed;
        // 当前弹幕最后一刻完全显示在屏幕的时间
        danmakuWidth = danmukuText.length * this.config.fontSize;
        let time3 = start + (this.config.speed * this.config.PlayResX) / (this.config.PlayResX + danmakuWidth);
        if (start >= time1 && time3 >= time2) {
          // 覆盖原来的
          lineRecords[0][i] = { danmukuPosition, danmukuText };
          return i;
        }
      }
    }
    // 底部弹幕和顶部弹幕
    if (type === 4 || type === 5) {
      let tempNum = 1;
      if (type === 5) tempNum = 2;
      for (let i = 0; i < lineRecords[tempNum].length; i++) {
        if (lineRecords[tempNum][i] === undefined) {
          lineRecords[tempNum][i] = { danmukuPosition, danmukuText };
          return i;
        }

        let pStart = parseFloat(lineRecords[tempNum][i].danmukuPosition[0]);
        if (start - pStart >= this.config.fixedSpeed) {
          lineRecords[tempNum][i] = { danmukuPosition, danmukuText };
          return i;
        }
      }
    }
    // 没位置了返回无穷大
    return Infinity;
  }
}

/**
 * 前置补零
 * @param num
 * @param length 数字总长度
 * @returns {string}
 */
function prefixInteger(num, length) {
  num = '' + num;
  return Array(length + 1 - num.length).join('0') + num;
}

/**
 * 格式化ass时间显示0:00:00.00
 * @param seconds
 * @returns {string}
 */
function formatTime(seconds) {
  const cs = ~~(100 * (seconds - ~~seconds));
  const ss = seconds % 60;
  const mm = ~~(seconds / 60) % 60;
  const hh = ~~(seconds / 60 / 60);
  return hh + ':' + prefixInteger(mm, 2) + ':' + prefixInteger(ss, 2) + '.' + prefixInteger(cs, 2);
}

module.exports = DanmukuConverter;
