const request = require('request');
const axios = require('axios');
const SocksProxyAgent = require('socks-proxy-agent');
const BilibiliConstants = require('../constants/BilibiliConstants');
const config = require('../config');

const baseRequest = request.defaults({
  headers: { 'User-Agent': config.UA },
});

const http = axios.create({
  baseURL: BilibiliConstants.API_HOST,
  timeout: 60000,
  headers: { 'User-Agent': config.UA },
});

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

module.exports.setProxy = function(proxy) {
  http.defaults.httpsAgent = new SocksProxyAgent(proxy);
  request.defaults.agent = new SocksProxyAgent(proxy);
};
module.exports.setCookie = function(cookie) {
  http.defaults.headers.common['Cookie'] = cookie;
  const j = request.jar();
  j.setCookie(cookie);
  baseRequest.defaults.jar = j;
};
module.exports.http = http; // axios实例
module.exports.request = baseRequest; // request实例
