/* eslint-disable no-await-in-loop,no-restricted-syntax */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import pLimit from 'p-limit';
import ora from 'ora';
import chalk from 'chalk';
import StringUtils from './StringUtils';
import BangumiApi from '../api/bangumi';
import DanmakuApi from '../api/danmaku';
import DanmakuConverter from './DanmakuConverter';
import FsUtil from './FsUtil';
import { decodeBv } from './BilibiliUtils';

const writeFile = promisify(fs.writeFile);

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class DanmakuDownloader {
  constructor(config = {}) {
    this.config = {
      basePath: 'output',
      maxConcurrency: 5,
      downloadRelatedSeason: true, // 自动下载相关的season，比如传递奈叶第一季的ss号，会自动下载其他几季的弹幕
      restTime: 100, // 太快不好，大批量弹幕文件下载时每个连接请求处理完成后休息一会，防被封，单位ms，爬虫建议设置为1000
    };
    Object.assign(this.config, config);
    this.danmakuConverter = new DanmakuConverter();
    this.limit = pLimit(this.config.maxConcurrency);
    this.spinner = ora('').start();
  }

  /**
   *
   * @param bangumiSymbol av124/ss34333
   * @param bangumiName
   * @returns {Promise<void>}
   */
  async download(bangumiSymbol, bangumiName = '') {
    if (bangumiSymbol.startsWith('ep')) {
      const epInfo = await BangumiApi.getEpisode(bangumiSymbol.substr(2));
      await this.download(`ss${epInfo.season_id}`, bangumiName);
      return;
    }
    await FsUtil.mkdirWhenNotExist(this.config.basePath);
    let outputPath = path.join(this.config.basePath, `${bangumiSymbol}${StringUtils.formatFilename(bangumiName)}`);
    let pageList = [];
    if (bangumiSymbol.startsWith('av') || bangumiSymbol.startsWith('BV')) {
      const aid = bangumiSymbol.startsWith('av') ? bangumiSymbol.substr(2) : decodeBv(bangumiSymbol);
      if (!bangumiName) {
        const bangumiDetail = await BangumiApi.getView(aid);
        outputPath += StringUtils.formatFilename(bangumiDetail.title);
      }
      await FsUtil.mkdirWhenNotExist(outputPath);
      const res = await BangumiApi.getPageList(aid);
      if (res === null) {
        console.log(`找不到番剧信息，已跳过[${bangumiSymbol}${bangumiName}]`);
        return;
      }
      pageList = res.data.map((e) => ({
        cid: e.cid,
        index: e.page,
        name: e.part,
      }));
    } else if (bangumiSymbol.startsWith('ss')) {
      const currentSeasonId = bangumiSymbol.substr(2);
      const res = await BangumiApi.getSeason(currentSeasonId);
      if (!bangumiName) {
        outputPath += StringUtils.formatFilename(res.result.series_title);
      }
      await FsUtil.mkdirWhenNotExist(outputPath);
      const seasonTitle = StringUtils.formatFilename(res.result.season_title);
      await FsUtil.mkdirWhenNotExist(path.join(outputPath, seasonTitle));
      res.result.episodes.forEach((e) => {
        e.season_title = seasonTitle;
      });
      const { episodes } = res.result;
      if (this.config.downloadRelatedSeason) {
        // 下载关联season
        const seasonIds = res.result.seasons.map((e) => e.season_id).filter((e) => `${e}` !== currentSeasonId);
        // eslint-disable-next-line no-restricted-syntax
        for (const seasonId of seasonIds) {
          const res1 = await BangumiApi.getSeason(seasonId);
          const seasonTitle1 = StringUtils.formatFilename(res1.result.season_title);
          await FsUtil.mkdirWhenNotExist(path.join(outputPath, seasonTitle1));
          res1.result.episodes.forEach((e) => {
            e.season_title = seasonTitle1;
          });
          episodes.push(...res1.result.episodes);
        }
      }
      pageList = episodes.map((e) => ({
        season_title: e.season_title,
        cid: e.cid,
        index: e.index,
        name: e.index_title,
      }));
    } else {
      Promise.reject(`找不到匹配的解析规则${bangumiSymbol}`);
      return;
    }
    const downloadPromiseList = [];
    for (const part of pageList) {
      downloadPromiseList.push(
        this.limit(async () => {
          let tempOutputPath = outputPath;
          if (part.season_title) {
            tempOutputPath = path.join(tempOutputPath, part.season_title);
          }
          const xmlData = await DanmakuApi.getXml(part.cid);
          let filename = part.index;
          if (part.name) {
            filename += `.${StringUtils.formatFilename(part.name)}`;
          }
          await writeFile(path.join(tempOutputPath, `${filename}.xml`), xmlData);
          await writeFile(path.join(tempOutputPath, `${filename}.ass`), this.danmakuConverter.convert(xmlData));
          this.spinner.text = `pending: ${this.limit.pendingCount}`;
          await sleep(this.config.restTime);
        })
      );
    }
    const currentSpiner = ora(chalk.blue(`${bangumiSymbol}${bangumiName}`)).start();
    await Promise.all(downloadPromiseList);
    currentSpiner.succeed(chalk.green(`${bangumiSymbol}${bangumiName}`));
  }
}

export default DanmakuDownloader;
