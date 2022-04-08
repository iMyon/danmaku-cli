const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ShebangPlugin = require('webpack-shebang-plugin');

const webpackConfig = {
  target: 'node', // koa项目仅在node环境下运行，因此设置称'node'
  entry: {
    // 设置入口文件
    server: path.join(__dirname, '../src/command/index.js'),
  },
  output: {
    // 设置打包后的文件和位置
    filename: 'danmaku.js',
    path: path.join(__dirname, '../lib'),
  },
  // devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.js|jsx$/,
        use: {
          loader: 'babel-loader',
        },
        // 尽量将 loader 应用于最少数量的必要模块，因此设置include
        // 只针对该目录下的js文件进行babel处理
        include: path.join(__dirname, '../src'),
      },
    ],
  },
  resolve: {
    // modules: 告诉webpack哪些目录需要搜索去匹配解析
    modules: [path.join(__dirname, '../src/command/index.js'), 'node_modules'],
    // extensions: 告诉webpack这些后缀文件需要去搜索匹配
    extensions: ['.js', '.json'],
    alias: {
      // 设置别名指向对应目录
      '@': path.join(__dirname, '../src'),
    },
  },
  plugins: [
    // 清除lib目录
    new CleanWebpackPlugin(),
    // 设置命令行工具头部表示标识
    new ShebangPlugin(),
  ],
  externals: [nodeExternals()], // 排除对node_modules里的依赖进行打包
};

module.exports = webpackConfig;
