/*
  Created by IntelliJ IDEA.
  User: Myon
  Date: 2019/7/17 22:36
*/

const SeasonsDownloaderTest = require('../../src/client/SeasonsDownloader');
describe('DownloadAllSeason', function() {
  it('download', async function() {
    this.timeout(Infinity);
    const seasonsDownloader = new SeasonsDownloaderTest({
      startPage: 2,
      stopPage: 3,
      pageSize: 1,
      sleepTime: 0,
    });
    await seasonsDownloader.download();
  });
});
