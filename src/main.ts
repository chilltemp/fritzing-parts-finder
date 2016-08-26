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
  let parts = [] as [FritzingPart];

  for (let src of config.sources) {
    let target = path.resolve(config.tempPath, src.name);
    let partSource = new PartSource(src, target);

    console.log(chalk.cyan('Fetching:'), chalk.magenta(partSource.name), 'from', partSource.url);
    await partSource.fetchSourceAsync();

    console.log(chalk.cyan('Scanning:'), partSource.target);
    let partFiles = await partSource.findPartFilesAsync();

    console.log(chalk.cyan('Processing:'), countFileTypes(partFiles));
    let processed = [] as [string];
    for (let fileName of partFiles) {
      try {
        if (path.extname(fileName) === '.fzp') {
          let part = await FritzingPart.fromFile(fileName);

          processed.push(fileName);
          parts.push(part);
          // console.log(part);
        }
      } catch (e) {
        console.error(chalk.red('Error reading part:'), fileName);
        console.error(e);
      }
    }

    console.log(chalk.cyan('Processed:'), countFileTypes(processed));
  }

  console.log(chalk.cyan('Writing index:'), parts.length, 'parts');
  let indexFileName = path.join(config.outputPath, 'index.json');
  console.log(indexFileName);
  await utils.writeFileAsync(indexFileName, JSON.stringify(parts, null, 2));
}

function countFileTypes(files: [string]): { [key: string]: number } {
  let counts: { [key: string]: number } = {};
  for (let name of files) {
    counts[path.extname(name)] = (counts[path.extname(name)] || 0) + 1;
  }
  return counts;
}

