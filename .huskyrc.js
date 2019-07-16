const tasks = arr => arr.join(' && ');

module.exports = {
  hooks: {
    'pre-commit': tasks([
      'pretty-quick --staged', // prettier自动格式化
      'lint-staged', // eslint语法校验
    ]),
  },
};
