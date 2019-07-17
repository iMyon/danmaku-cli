const DanmukuConverter = require('../../src/utils/DanmukuConverter');
const converter = new DanmukuConverter();
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const readFile = promisify(fs.readFile);
describe('DanmukuConverter', function() {
  it('convert', async function() {
    const data = await readFile(path.join(__dirname, 'resources', '1147523.xml'));
    const result = converter.convert(data);
    console.log(result);
  });
});
