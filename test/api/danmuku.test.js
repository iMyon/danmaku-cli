const BangumiApi = require('../../src/api/bangumi');
const DanmukuApi = require('../../src/api/danmuku');

const aid = 789232;
describe('client', function() {
  it('getXml', async function() {
    this.timeout(60000);
    const bangumiInfo = await BangumiApi.getPageList(aid);
    const result = await DanmukuApi.getXml(bangumiInfo[0].cid);
    console.log(result);
  });
});
