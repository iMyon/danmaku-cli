import cheerio from 'cheerio';
import { http } from '../utils/HttpUtil';
import BilibiliConstants from '../constants/BilibiliConstants';
import config from '../config';

class BangumiApi {
  static getPageList(aid) {
    return http.get(`${BilibiliConstants.API_HOST}/x/player/pagelist?aid=${aid}`);
  }

  static getView(aid, page = 1) {
    return http.get(`/view?type=json&appkey=${config.appKey}&id=${aid}&page=${page}`);
  }

  static getBangumiList(params = {}) {
    params = {
      area: 2,
      page: 1,
      pagesize: 10,
      season_type: 1,
      is_finish: -1,
      season_version: -1,
      season_status: -1,
      season_month: -1,
      copyright: -1,
      pub_date: -1,
      style_id: -1,
      order: 3,
      st: 1,
      sort: 0,
      ...params,
    };
    return http.get(`${BilibiliConstants.BANGUMI_HOST}/media/web_api/search/result`, { params });
  }

  static getNewList(params = {}) {
    params = { rid: 32, type: 0, pn: 1, ps: 20, ...params };
    return http.get(`/x/web-interface/newlist`, { params });
  }

  static getSpview(spid) {
    return http.get(`/spview?session_id=${spid}`);
  }

  static getSeason(seasonId) {
    return http.get(`${BilibiliConstants.BANGUMI_HOST}/view/web_api/season?season_id=${seasonId}`);
  }

  static async getEpisode(epId) {
    const result = await http.get(`${BilibiliConstants.MAIN_HOST}/bangumi/play/ep${epId}/`);
    const $ = cheerio.load(result);
    const titleMeta = $('meta[property="og:title"]');
    const seasonMeta = $('meta[property="og:url"]');
    const sessionId = seasonMeta.attr('content').match(/ss(\d+)/)[1];
    return {
      title: titleMeta.attr('content'),
      season_id: sessionId,
    };
  }
}

export default BangumiApi;
