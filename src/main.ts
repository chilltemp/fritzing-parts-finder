import * as chalk from 'chalk';
import * as path from 'path';
import * as utils from './lib/utils';
import { PartSource } from './lib/PartSource';
import { IConfig } from './lib/interfaces.ts';
import { FritzingPart } from './lib/FritzingPart';
let config = require('./config') as IConfig;


main()
  .catch((err) => {
    console.error(err);
  });

async function main() {
  for (let src of config.sources) {
    let target = path.resolve(config.localPath, src.name);
    let partSource = new PartSource(src, target);

    console.log(chalk.cyan('Fetching:'), chalk.magenta(partSource.name), 'from', partSource.url);
    await partSource.fetchSourceAsync();

    console.log(chalk.cyan('Scanning:'), partSource.target);
    let partFiles = await partSource.findPartFilesAsync();

    console.log(chalk.cyan('Processing:'), countFileTypes(partFiles));
    for (let fileName of partFiles) {
      if(path.extname(fileName) === '.fzp') {
      let part = await FritzingPart.fromFile(fileName);
      console.log(part);
    }}
  }
}

function countFileTypes(files: [string]): { [key: string]: number } {
  let counts: { [key: string]: number } = {};
  for (let name of files) {
    counts[path.extname(name)] = (counts[path.extname(name)] || 0) + 1;
  }
  return counts;
}

