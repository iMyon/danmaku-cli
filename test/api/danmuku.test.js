const DanmukuApi = require('../../src/api/danmuku');
const DanmukuConverter = require('../../src/utils/DanmukuConverter');
const converter = new DanmukuConverter();
const cid = 1147523;
describe('danmuku api', function() {
  it('getXml', async function() {
    this.timeout(60000);
    const result = await DanmukuApi.getXml(cid);
    console.log(result);
  });
});
