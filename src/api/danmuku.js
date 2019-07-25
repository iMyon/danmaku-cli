const { http } = require('../utils/HttpUtil');
const zlib = require('zlib');
const request = require('request');
const SocksProxyAgent = require('socks-proxy-agent');
const chalk = require('chalk');
const config = require('../config');

class DanmukuApi {
  static async getXml(cid) {
    const requestConfig = { encoding: 'binary' };
    if (process.env.DANMUKU_SOCKS_PROXY) {
      requestConfig.agent = new SocksProxyAgent(process.env.DANMUKU_SOCKS_PROXY);
      requestConfig.headers = {
        'User-Agent': config.UA,
      };
    }
    return new Promise((resolve, reject) => {
      request.get(`https://comment.bilibili.com/${cid}.xml`, requestConfig, function(err, resp, body) {
        if (err) {
          reject(err);
        } else if (resp.headers['content-encoding'] === 'deflate') {
          // console.log(Buffer.isBuffer(body))
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
