import * as chalk from 'chalk';
import * as path from 'path';
import * as ProgressBar from 'progress';
import * as utils from './lib/utils';
import { GitPartSource } from './lib/GitPartSource';
import { IPartSource, PartSource } from './lib/PartSource';
import { IPartsFinderConfig } from './lib/interfaces.ts';
import { FritzingPart } from './lib/FritzingPart';
let config = require('./config') as IPartsFinderConfig;


main()
  .catch((err) => {
    console.error(chalk.red(err && err.stack ? err.stack : err));
  });

async function main() {
  let parts = [] as [FritzingPart];

  for (let src of config.sources) {
    let target = path.resolve(config.tempPath, src.name);
    let partSource: IPartSource = new GitPartSource(src, target);

    console.log(chalk.cyan('Fetching:'), chalk.magenta(partSource.name), 'from', partSource.url);
    await partSource.fetchSourceAsync();

    console.log(chalk.cyan('Scanning:'), partSource.targetPath);
    let partFiles = await partSource.findPartFilesAsync();

    console.log(chalk.cyan('Processing:'), countFileTypes(partFiles));
    let bar = new ProgressBar('[:bar]', { total: partFiles.length });

    let processed = [] as [string];
    for (let fileName of partFiles) {
      try {
        let part: FritzingPart = null;
        let fileExt = path.extname(fileName);

        switch (fileExt) {
          case '.fzp':
            part = await partSource.readPartAsync(fileName);
            break;

          case '.fzpz':
            //part = await partSource.readFzpzAsync(fileName);
            break;

          default:
            break;
        }

        if (part) {
          processed.push(fileName);
          parts.push(part);
          // console.log(part);
        }
      } catch (e) {
        console.error(chalk.red('Error reading part:'), fileName);
        console.error(e);
      }

      bar.tick();
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

