const BangumiApi = require('../../src/api/bangumi');

const aid = 789232;
describe('client', function() {
  it('getPageList', async function() {
    this.timeout(60000);
    const result = await BangumiApi.getPageList(aid);
    console.log(result);
  });
  it('getView', async function() {
    this.timeout(60000);
    const result = await BangumiApi.getView(aid);
    console.log(result);
  });
});
