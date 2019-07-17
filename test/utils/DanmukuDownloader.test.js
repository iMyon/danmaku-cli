const DanmukuDownloader = require('../../src/utils/DanmukuDownloader');
const downloader = new DanmukuDownloader();
describe('DanmukuDownloader', function() {
  it('download av', async function() {
    this.timeout(60000);
    await downloader.download('av2182624');
  });
  it('download sp', async function() {
    this.timeout(60000);
    await downloader.download('ss1535');
  });
});
