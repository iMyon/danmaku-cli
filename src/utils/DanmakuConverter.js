const XmlJs = require('xml-js');
const StringUtils = require('./StringUtils');

class DanmakuConverter {
  constructor(config = {}) {
    this.config = {
      PlayResX: 1920, // 分辨率 宽
      PlayResY: 1080, // 分辨率 高
      font: '微软雅黑', // 字体
      bold: true, // 是否加粗
      fontSize: 40, // 字体大小
      lineLimit: 50, // 弹幕最大行数
      speed: 12, // 滚动弹幕驻留时间（秒），越小越快
      fixedSpeed: 4, // 顶端/底部弹幕驻留时间（秒），越小越快
      alpha: 140, // 弹幕透明度,256为全透明，0为不透明
    };
    Object.assign(this.config, config);
    let alpha16 = this.config.alpha.toString(16);
    this.config.alpha = prefixInteger(alpha16, 2);
    if (this.config.fontSize * this.config.lineLimit > this.config.PlayResY) {
      this.config.lineLimit = ~~(this.config.PlayResY / this.config.fontSize);
    }
  }
  convert(xmlString) {
    const xmlJson = XmlJs.xml2js(xmlString, { compact: true });
    let dElements = xmlJson.i.d;
    if (dElements) {
      if (!(dElements instanceof Array)) {
        dElements = [dElements];
      }
    } else {
      dElements = [];
    }

    let danmakuHeader = `\ufeff[Script Info]
ScriptType: v4.00+
Collisions: Normal
PlayResX: ${this.config.PlayResX}
PlayResY: ${this.config.PlayResY}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,微软雅黑,54,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0.00,0.00,1,1,0,2,20,20,120,0
Style: Danmaku,${this.config.font},${this.config.fontSize},&H${this.config.alpha}FFFFFF,&H${
      this.config.alpha
    }FFFFFF,&H${this.config.alpha}000000,&H${this.config.alpha}000000,${~~this.config
      .bold},0,0,0,100,100,0.00,0.00,1,1,0,2,20,20,20,0\n`;

    let eventsString = `[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;

    // 保存lineCount大小的数组
    // 每个元素保存最后一次出现在行数下标+1的dsArray元素
    // lineRecords[type][dsaArray[num]] type:0 滚动 1 顶部 2底部
    const lineRecords = [Array(this.config.lineLimit), Array(this.config.lineLimit), Array(this.config.lineLimit)];

    const danmakuList = dElements
      .map(e => {
        return {
          danmakuPosition: e._attributes.p.split(',').map(e => {
            return Number(e);
          }),
          danmakuText: e._text,
        };
      })
      .sort((a, b) => {
        return a.danmakuPosition[0] > b.danmakuPosition[0] ? 1 : -1;
      });
    for (let i = 0; i < danmakuList.length; i++) {
      const { danmakuPosition, danmakuText } = danmakuList[i];
      const text = danmakuText;
      if (text === undefined) continue;
      let layer = -3;
      let type = 1;
      const start = ~~danmakuPosition[0];
      let end = start + this.config.speed;
      let move1 = this.config.PlayResX + (text.length * this.config.fontSize) / 2;
      let move24 = this.config.fontSize;
      const move3 = 0 - (text.length * this.config.fontSize) / 2;
      const color = prefixInteger((~~danmakuPosition[3]).toString(16), 6).replace(/(.{2})(.{2})(.{2})/, '$3$2$1');

      // 获取字幕插入的行
      let line = this.getDanmakuFitLine({ danmakuPosition, danmakuText }, lineRecords, ~~danmakuPosition[1]);
      // 抛弃超出范围的弹幕
      if (line === Infinity) continue;

      line++; // 数组下标+1

      // 移动弹幕处理
      if (danmakuPosition[1] < 4) {
        move24 = move24 * line;
      }
      // 固定弹幕处理
      else if (danmakuPosition[1] === 4 || danmakuPosition[1] === 5) {
        type = 2;
        layer = -2; // 字幕置于稍高层
        move1 = this.config.PlayResX / 2;
        end = start + this.config.fixedSpeed;
        // 底部弹幕处理
        if (danmakuPosition[1] === 4) {
          move24 = this.config.PlayResY - (line - 1) * this.config.fontSize;
        }
        // 顶部弹幕处理
        if (danmakuPosition[1] === 5) {
          move24 = line * this.config.fontSize;
        }
      }
      // 高级弹幕，告辞
      else {
        continue;
      }
      const ef = type === 1 ? `\\move(${move1}, ${move24}, ${move3}, ${move24})` : `\\pos(${move1}, ${move24})`;
      const eventString = `Dialogue: ${layer},${formatTime(start)},${formatTime(
        end
      )},Danmaku,,0000,0000,0000,,{${ef}\\c&H${color}}${text}`;
      eventsString = eventsString + eventString + '\n';
    }
    return `${danmakuHeader}\n${eventsString}`;
  }

  /**
   * 获取弹幕应该放置的行数（防重叠）
   * @param danmakuPosition
   * @param danmakuText
   * @param lineRecords
   * @param type 弹幕类型 1-3滚动 4底部 5顶部
   * @returns {number}
   */
  getDanmakuFitLine({ danmakuPosition, danmakuText }, lineRecords, type) {
    let start = parseFloat(danmakuPosition[0]);
    // 滚动弹幕
    if (type <= 3) {
      for (let i = 0; i < lineRecords[0].length; i++) {
        if (lineRecords[0][i] === undefined) {
          lineRecords[0][i] = { danmakuPosition, danmakuText };
          return i;
        }
        let pStart = parseFloat(lineRecords[0][i].danmakuPosition[0]);
        const pDanmakuWidth = StringUtils.measureText(lineRecords[0][i].danmakuText, this.config.fontSize);

        // 待比较弹幕首次完全显示在屏幕的时间
        let time1 = pStart + (this.config.speed * pDanmakuWidth) / (this.config.PlayResX + pDanmakuWidth);
        // 待比较弹幕完全消失在屏幕的时间
        let time2 = pStart + this.config.speed;
        // 当前弹幕最后一刻完全显示在屏幕的时间
        const danmakuWidth = StringUtils.measureText(danmakuText, this.config.fontSize);
        let time3 = start + (this.config.speed * this.config.PlayResX) / (this.config.PlayResX + danmakuWidth);
        if (start >= time1 && time3 >= time2) {
          // 覆盖原来的
          lineRecords[0][i] = { danmakuPosition, danmakuText };
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
          lineRecords[tempNum][i] = { danmakuPosition, danmakuText };
          return i;
        }

        let pStart = parseFloat(lineRecords[tempNum][i].danmakuPosition[0]);
        if (start - pStart >= this.config.fixedSpeed) {
          lineRecords[tempNum][i] = { danmakuPosition, danmakuText };
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

module.exports = DanmakuConverter;
