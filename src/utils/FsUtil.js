const fs = require('fs');
const { promisify } = require('util');
const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

class FsUtil {
  static async mkdirWhenNotExist(path = '') {
    if (!path) return;
    if (!(await exists(path))) {
      await mkdir(path);
    }
  }
}

module.exports = FsUtil;
