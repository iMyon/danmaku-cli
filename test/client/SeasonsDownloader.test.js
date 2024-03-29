/*
  Created by IntelliJ IDEA.
  User: Myon
  Date: 2019/7/17 22:36
*/

import SeasonsDownloaderTest from '../../src/client/SeasonsDownloader';

describe('DownloadAllSeason', function () {
  it('download', async function () {
    this.timeout(Infinity);
    const seasonsDownloader = new SeasonsDownloaderTest({
      startPage: 2,
      stopPage: 2,
      pageSize: 1,
      sleepTime: 0,
    });
    await seasonsDownloader.download();
  });
});
