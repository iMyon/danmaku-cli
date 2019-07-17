/*
  Created by IntelliJ IDEA.
  User: Myon
  Date: 2019/7/17 22:36
*/

const DownloadAllSeason = require('../../src/client/DownloadAllSeason');
describe('DownloadAllSeason', function() {
  it('downloadAll', async function() {
    this.timeout(600000);
    await DownloadAllSeason.downloadAll();
  });
});
