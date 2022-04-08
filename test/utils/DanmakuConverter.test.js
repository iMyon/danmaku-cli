import DanmakuConverter from '../../src/utils/DanmakuConverter';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const readFile = promisify(fs.readFile);
const converter = new DanmakuConverter();

describe('DanmakuConverter', function () {
  it('convert', async function () {
    const data = await readFile(path.join(__dirname, 'resources', '1147523.xml'));
    const result = converter.convert(data);
    console.log(result);
  });
});
