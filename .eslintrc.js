// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  extends: ['eslint:recommended'],
  rules: {
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // 关闭分号替代 ASI
    semi: [0],
    // 禁止不必要的分号
    'no-extra-semi': 1,
    // 禁止未使用过的变量
    'no-unused-vars': [1, { vars: 'all', args: 'none' }],
    // 单双引号
    quotes: [1, 'single', { allowTemplateLiterals: true }],
    'no-console': [0],
    // 要求或禁止函数圆括号之前有一个空格
    'space-before-function-paren': [0, 'never'],
    // 要求或禁止块之前使用一致的空格
    'space-before-blocks': [0, 'never'],
    // 要求或禁止末尾逗号
    'comma-dangle': [0, 'never'],
    // 强制使用一致的缩进
    indent: [0],
    // 禁用行尾空格
    'no-trailing-spaces': [0],
    // 注释/后空一格
    'spaced-comment': [1],
    // 禁止使用 new
    'no-new': [0],
    // 禁止 return await
    'no-return-await': [0],
    'no-async-promise-executor': [0],
  },
};
