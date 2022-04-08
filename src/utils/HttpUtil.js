import request from 'request';
import axios from 'axios';
import SocksProxyAgent from 'socks-proxy-agent';
import BilibiliConstants from '../constants/BilibiliConstants';
import config from '../config';

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

export const setProxy = proxy => {
  http.defaults.httpsAgent = new SocksProxyAgent(proxy);
  request.defaults.agent = new SocksProxyAgent(proxy);
};

export const setCookie = function(cookie) {
  http.defaults.headers.common['Cookie'] = cookie;
  const j = request.jar();
  j.setCookie(cookie);
  baseRequest.defaults.jar = j;
};

export { http, baseRequest as request };
