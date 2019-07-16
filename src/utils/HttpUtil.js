const axios = require('axios');

const http = axios.create({
  baseURL: 'https://api.bilibili.com/',
  timeout: 60000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0',
  },
});
http.interceptors.response.use(
  function(response) {
    return response.data;
  },
  function(error) {
    error.message = `Request url: ${error.request.path}\n${error.message}`;
    return Promise.reject(error);
  }
);

module.exports.http = http;
