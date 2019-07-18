/*
  Created by IntelliJ IDEA.
  User: Myon
  Date: 2019/7/17 22:36
*/

const SeasonsDownloaderTest = require('../../src/client/SeasonsDownloader');
const seasonsDownloader = new SeasonsDownloaderTest();
describe('DownloadAllSeason', function() {
  it('download', async function() {
    this.timeout(Infinity);
    await seasonsDownloader.download();
  });
});
