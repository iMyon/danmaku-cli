#!/usr/bin/env node

import program from 'commander';
import convert from './convert';
import download from './download';
import downloadSeasons from './download-seasons';
import downloadFinishBangumi from './download-finish-bangumi';
import { setCookie, setProxy } from '../utils/HttpUtil';

program.version('0.0.1');

program.install = (plugin) => {
  plugin(program);
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
  setCookie(opts.cookie);
}
if (opts.proxy) {
  setProxy(opts.proxy);
}
