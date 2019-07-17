const { http } = require('../utils/HttpUtil');
class BangumiApi {
  static getPageList(aid) {
    return http.get(`https://www.bilibili.com/widget/getPageList?aid=${aid}`);
  }

  static getView(aid, page = 1) {
    return http.get(`/view?type=json&appkey=03fc8eb101b091fb&id=${aid}&page=${page}`);
  }

  static getBangumiList(page = 1) {
    return http.get(
      `https://bangumi.bilibili.com/media/web_api/search/result?season_version=-1&area=2&is_finish=-1&copyright=-1&season_status=-1&season_month=-1&pub_date=-1&style_id=-1&order=3&st=1&sort=0&page=${page}&season_type=1&pagesize=30`
    );
  }
}

module.exports = BangumiApi;
