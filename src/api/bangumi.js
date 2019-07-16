const { http } = require('../utils/HttpUtil');
class BangumiApi {
  static getPageList(aid) {
    return http.get(`https://www.bilibili.com/widget/getPageList?aid=${aid}`);
  }

  static getView(aid, page = 1) {
    return http(`/view?type=json&appkey=03fc8eb101b091fb&id=${aid}&page=${page}`);
  }
}

module.exports = BangumiApi;
