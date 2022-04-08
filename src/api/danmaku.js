import zlib from 'zlib';
import chalk from 'chalk';
import { request } from '../utils/HttpUtil';

class DanmakuApi {
  static async getXml(cid) {
    const requestConfig = { encoding: 'binary' };
    if (request.defaults.agent) {
      requestConfig.agent = request.defaults.agent;
    }
    return new Promise((resolve, reject) => {
      // axios会抛错所以使用request手动处理压缩
      request.get(`https://comment.bilibili.com/${cid}.xml`, requestConfig, (err, resp, body) => {
        if (err) {
          reject(err);
        } else if (resp.headers['content-encoding'] === 'deflate') {
          zlib.inflateRaw(Buffer.from(body, 'binary'), (err2, result) => {
            if (err2) {
              reject(err2);
              return;
            }
            resolve(result.toString());
          });
        } else if (resp.statusCode >= 400) {
          if (resp.statusCode === 412) {
            console.error(chalk.red('已触发B站安全策略'));
          }
          reject(resp);
        } else {
          resolve(body);
        }
      });
    });
  }
}

export default DanmakuApi;
