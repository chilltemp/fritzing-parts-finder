#!/usr/bin/env node
'use strict'

let P = require('bluebird');
let path = require('path');
let program = require('commander');

let sources = require('./lib/sources');
let pkg = require('./package.json');
let config = require('./config.json');

program
  .version(pkg.version)
  .option('-p, --path <path>', 'Path for downloaded files')
  .parse(process.argv);

let sourcePath = program.path || 'sources';

P.mapSeries(config.sources, (src) => {
  let target = path.resolve(sourcePath, src.id);

  return sources.fetchSourceAsync(src.url, target);
})
.then((results) => {
  console.log('DONE');
})
.catch((err) => {
  throw err;
});

