const axios = require('axios');
const SocksProxyAgent = require('socks-proxy-agent');

const http = axios.create({
  baseURL: 'https://api.bilibili.com/',
  timeout: 60000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0',
  },
});
if (process.env.DANMUKU_SOCKS_PROXY) {
  http.defaults.httpsAgent = new SocksProxyAgent(process.env.DANMUKU_SOCKS_PROXY);
}

http.interceptors.response.use(
  function(response) {
    if (response.data && response.data.code === -404) {
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
