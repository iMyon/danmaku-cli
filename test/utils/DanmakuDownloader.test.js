const DanmakuDownloader = require('../../src/utils/DanmakuDownloader');
const downloader = new DanmakuDownloader();
describe('DanmakuDownloader', function() {
  it('download av', async function() {
    this.timeout(60000);
    // av38989970会员视频
    // av36449229 地区限制
    await downloader.download('av135433');
  });
  it('download ss', async function() {
    this.timeout(60000);
    await downloader.download('ss1535');
  });
  it('download ep', async function() {
    this.timeout(60000);
    await downloader.download('ep276626');
  });
});
