const DanmukuDownloader = require('../../src/utils/DanmukuDownloader');
const downloader = new DanmukuDownloader();
describe('DanmukuDownloader', function() {
  it('download av', async function() {
    this.timeout(60000);
    // av38989970会员视频
    // av36449229 地区限制
    await downloader.download('av135433');
  });

  it('download BV', async function() {
    this.timeout(60000);
    await downloader.download('BV1Mx411w7Aq');
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
