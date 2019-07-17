const BangumiApi = require('../../src/api/bangumi');

const aid = 789232;
describe('bangumi api', function() {
  it('getView', async function() {
    this.timeout(60000);
    const result = await BangumiApi.getView(aid);
    console.log(result);
  });
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
  it('getSpview', async function() {
    this.timeout(60000);
    const result = await BangumiApi.getSpview(28019);
    console.log(result);
  });
  it('getSeason', async function() {
    this.timeout(60000);
    const result = await BangumiApi.getSeason(27728);
    console.log(result);
  });
});
