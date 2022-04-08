import * as fs from 'fs';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

export default class FsUtil {
  static async mkdirWhenNotExist(path = '') {
    if (!path) return;
    if (!(await exists(path))) {
      await mkdir(path);
    }
  }
}
