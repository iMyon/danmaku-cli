const { http } = require('../utils/HttpUtil');

class DanmukuApi {
  static getXml(cid) {
    return http.get(`https://comment.bilibili.com/${cid}.xml`, {
      responseType: 'text',
    });
  }
}

module.exports = DanmukuApi;
