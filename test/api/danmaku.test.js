import DanmakuApi from '../../src/api/danmaku';

const cid = 1147523;

describe('danmaku api', function() {
  it('getXml', async function() {
    this.timeout(60000);
    const result = await DanmakuApi.getXml(cid);
    console.log(result);
  });
});
