const zlib = require('zlib');
const { request } = require('../utils/HttpUtil');
const chalk = require('chalk');
const BilibiliConstants = require('../constants/BilibiliConstants');
class DanmukuApi {
  static async getXml(cid) {
    const requestConfig = { encoding: 'binary' };
    if (request.defaults.agent) {
      requestConfig.agent = request.defaults.agent;
    }
    return new Promise((resolve, reject) => {
      // axios会抛错所以使用request手动处理压缩
      request.get(`${BilibiliConstants.API_HOST}/x/v1/dm/list.so?oid=${cid}`, requestConfig, function(err, resp, body) {
        if (err) {
          reject(err);
        } else if (resp.headers['content-encoding'] === 'deflate') {
          zlib.inflateRaw(Buffer.from(body, 'binary'), function(err, result) {
            if (err) {
              reject(err);
              return;
            }
            resolve(result.toString());
          });
        } else {
          if (resp.statusCode >= 400) {
            if (resp.statusCode === 412) {
              console.error(chalk.red('已触发B站安全策略，请不要大规模进行爬虫动作！'));
            }
            reject(resp);
          } else {
            resolve(body);
          }
        }
      });
    });
  }
}

module.exports = DanmukuApi;
