import * as chalk from 'chalk';
import * as path from 'path';
import * as commander from 'commander';
import { PartSource } from './lib/PartSource';
import { IConfig } from './lib/interfaces.ts';
import { FritzingPart } from './lib/FritzingPart';
let config = require('./config') as IConfig;
let pkg = require('../package');

interface IProgramArgs extends commander.ICommand {
  path?: string;
}

const args: IProgramArgs = commander
  .version(pkg.version)
  .option('-p, --path <path>', 'Path for downloaded files')
  .parse(process.argv);

main(args)
  .catch((err) => {
    console.error(err);
  });

async function main(argv: IProgramArgs) {
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

