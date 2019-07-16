const axios = require('axios');

const http = axios.create({
  baseURL: 'https://api.bilibili.com/',
  timeout: 60000,
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
