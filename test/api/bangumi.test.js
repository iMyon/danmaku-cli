const BangumiApi = require('../../src/api/bangumi');
const assert = require('assert');

const aid = 789232;
describe('bangumi api', function() {
  it('getView', async function() {
    this.timeout(60000);
    const result = await BangumiApi.getView(aid);
    assert.ok(result.code !== -1);
    console.log(result);
  });
  it('getPageList', async function() {
    this.timeout(60000);
    const result = await BangumiApi.getPageList(aid);
    console.log(result);
  });
  it('getBangumiList', async function() {
    this.timeout(60000);
    const result = await BangumiApi.getBangumiList({ page: 1, pagesize: 1 });
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
  it('getEpisode', async function() {
    this.timeout(60000);
    const result = await BangumiApi.getEpisode(276626);
    console.log(result);
  });
  it('getNewList', async function() {
    this.timeout(60000);
    const result = await BangumiApi.getNewList({ ps: 3 });
    console.log(result);
  });
});
