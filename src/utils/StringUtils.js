/*
  Created by IntelliJ IDEA.
  User: Myon
  Date: 2019/7/17 22:44
*/

const eaw = require('eastasianwidth');

class StringUtils {
  static formatFilename(str) {
    return str
      .trim()
      .replace(/\?/g, '？')
      .replace(/\|/g, '¦')
      .replace(/(\\|\/|:|\*|"|<|>|\t|\r|\n)/g, '');
  }

  static measureText(text, fontSize) {
    return (eaw.length(text) * fontSize) / 2;
  }
}

module.exports = StringUtils;
