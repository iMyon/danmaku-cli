const BangumiApi = require('../../src/api/bangumi');

const aid = 789232;
describe('bangumi api', function() {
  it('getPageList', async function() {
    this.timeout(60000);
    const result = await BangumiApi.getPageList(aid);
    console.log(result);
  });
  it('getBangumiList', async function() {
    this.timeout(60000);
    const result = await BangumiApi.getBangumiList();
    console.log(result);
  });
});
