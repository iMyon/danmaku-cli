const DanmukuDownloader = require('../../src/utils/DanmukuDownloader');
const downloader = new DanmukuDownloader();
describe('DanmukuConverter', function() {
  it('convert', async function() {
    this.timeout(60000);
    await downloader.download(789232);
  });
});
