#!/usr/bin/env node

const program = require('commander');
const download = require('./download');
const convert = require('./convert');
const downloadSeasons = require('./download-seasons');
const downloadFinishBangumi = require('./download-finish-bangumi');
const HttpUtil = require('../utils/HttpUtil');

program.version('0.0.1');

program.install = function(plugin) {
  plugin(this);
};

program.install(convert);
program.install(download);
program.install(downloadSeasons);
program.install(downloadFinishBangumi);
program.option('--cookie [string]', 'cookie').option('--proxy [string]', 'socks proxy');

if (process.argv.length <= 2) {
  // 不加参数输出help
  program.outputHelp();
}

program.parse(process.argv);

const opts = program.opts();
if (opts.cookie) {
  HttpUtil.setCookie(opts.cookie);
}
if (opts.proxy) {
  HttpUtil.setProxy(opts.proxy);
}
