const { http } = require('../utils/HttpUtil');
const zlib = require('zlib');
const request = require('request');
const SocksProxyAgent = require('socks-proxy-agent');

class DanmukuApi {
  static async getXml(cid) {
    return new Promise((resolve, reject) => {
      request.get(
        `https://comment.bilibili.com/${cid}.xml`,
        { encoding: 'binary', agent: new SocksProxyAgent('socks5://127.0.0.1:1088') },
        function(err, resp, body) {
          if (err) {
            reject(err);
          }
          if (resp.headers['content-encoding'] === 'deflate') {
            // console.log(Buffer.isBuffer(body))
            zlib.inflateRaw(Buffer.from(body, 'binary'), function(err, result) {
              if (err) {
                reject(err);
                return;
              }
              resolve(result.toString());
            });
          } else {
            resolve(body);
          }
        }
      );
    });
  }
}

module.exports = DanmukuApi;
