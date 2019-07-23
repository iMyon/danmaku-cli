#!/usr/bin/env node

const chalk = require('chalk');
const program = require('commander');
const inquirer = require('inquirer');
const download = require('./download');
const convert = require('./convert');
const downloadSeasons = require('./download-seasons');

// console.log(chalk.green('Welcome!'));

program.version('0.0.1');

program.install = function(plugin) {
  plugin(this);
};

program.install(convert);
program.install(download);
program.install(downloadSeasons);

if (process.argv.length <= 2) {
  // 不加参数输出help
  program.outputHelp();
}

program.parse(process.argv);
