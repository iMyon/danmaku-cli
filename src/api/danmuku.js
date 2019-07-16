const { http } = require('../utils/HttpUtil');

class DanmukuApi {
  static getXml(cid) {
    return http(`https://comment.bilibili.com/${cid}.xml`);
  }
}

module.exports = DanmukuApi;
