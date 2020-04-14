const DanmakuConverter = require('../../src/utils/DanmakuConverter');
const converter = new DanmakuConverter();
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const readFile = promisify(fs.readFile);
describe('DanmakuConverter', function() {
  it('convert', async function() {
    const data = await readFile(path.join(__dirname, 'resources', '1147523.xml'));
    const result = converter.convert(data);
    console.log(result);
  });
});
