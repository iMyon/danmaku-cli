const axios = require('axios');
const SocksProxyAgent = require('socks-proxy-agent');
const BilibiliConstants = require('../constants/BilibiliConstants');
const config = require('../config');

const http = axios.create({
  baseURL: BilibiliConstants.API_HOST,
  timeout: 60000,
  headers: {
    'User-Agent': config.UA,
  },
});
if (process.env.DANMUKU_SOCKS_PROXY) {
  http.defaults.httpsAgent = new SocksProxyAgent(process.env.DANMUKU_SOCKS_PROXY);
}

http.interceptors.response.use(
  function(response) {
    if (response.data && response.data.code <= -400) {
      return Promise.reject(response.data);
    }
    return response.data;
  },
  function(error) {
    error.message = `Request url: ${error.config.url}\n${error.message}`;
    return Promise.reject(error);
  }
);

module.exports.http = http;
