/*
  Created by IntelliJ IDEA.
  User: Myon
  Date: 2019/7/17 22:44
*/

class StringUtils {
  static formatFilename(str) {
    return str
      .trim()
      .replace(/\?/g, '？')
      .replace(/\|/g, '¦')
      .replace(/(\\|\/|:|\*|"|<|>|\t|\r|\n)/g, '');
  }
}

module.exports = StringUtils;
