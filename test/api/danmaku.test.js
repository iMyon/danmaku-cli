const DanmakuApi = require('../../src/api/danmaku');
const DanmakuConverter = require('../../src/utils/DanmakuConverter');
const converter = new DanmakuConverter();
const cid = 1147523;
describe('danmaku api', function() {
  it('getXml', async function() {
    this.timeout(60000);
    const result = await DanmakuApi.getXml(cid);
    console.log(result);
  });
});
