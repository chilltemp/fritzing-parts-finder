import * as path from 'path';
import * as glob from 'glob';
import * as simpleGit from 'simple-git';
import * as fs from 'fs';
import * as utils from './utils';
import { IPartsFinderSource } from './interfaces.ts';
import { FritzingPart } from './FritzingPart';

export class PartSource {
  public name: string;
  public target: string;
  public url: string;
  private partsPattern: string;
  private svgPath: string;

  constructor(src: IPartsFinderSource, target: string) {
    this.name = src.name;
    this.url = src.url;
    this.partsPattern = src.partsPath
      ? path.join(target, src.partsPath, '**/*.fz*')
      : path.join(target, '**/*.fz*');
    this.svgPath = src.svgPath;
    this.target = target;
  }

  public fetchSourceAsync(): Promise<any> {

    return this.fileExists(this.target)
      .then((exists) => {
        if (exists) {
          return new Promise((resolve, reject) => {
            let git = simpleGit(this.target);
            git.pull((err: any) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
        } else {
          return new Promise((resolve, reject) => {
            let git = simpleGit();
            git.clone(this.url, this.target, (err: any) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
        }
      });
  }

  public findPartFilesAsync(): Promise<[string]> {
    return new Promise((resolve, reject) => {
      glob(this.partsPattern, (err, matches) => {
        if (err) {
          reject(err);
        } else {
          resolve(matches);
        }
      });
    });
  }

  public async readPart(fileName: string): Promise<FritzingPart> {
    let content = await utils.readFileAsync(fileName);
    return await this.parsePartXml(content);
  }

  private async parsePartXml(xml: string): Promise<FritzingPart> {
    let source = await utils.convertFromXml(xml);
    let part = new FritzingPart();

    if (!source || !source.module) {
      throw new Error('Source is null or missing its root.');
    }

    part.version = utils.makeSafeString(source.module.version);
    part.title = utils.makeSafeString(source.module.title);
    part.label = utils.makeSafeString(source.module.label);
    part.date = utils.makeSafeString(source.module.date);
    part.description = utils.makeSafeString(source.module.description);

    if (source.module.tags &&      source.module.tags.tag ) {
      this.loadStringsFromXml(part.tags, source.module.tags.tag);
    }

    if (source.module.properties && source.module.properties.property) {
      this.loadNameValuesFromXml(part.properties, source.module.properties.property);
    }

    if (source.module.views) {
      console.log(source.module.views);
    }

    return part;
  }

  private loadStringsFromXml(target: [string], xmlArray: any) {
    if (!xmlArray || !Array.isArray(xmlArray)) {
      return;
    }

    for (let tag of xmlArray) {
      target.push(utils.makeSafeString(tag));
    }
  }

  private loadNameValuesFromXml(target: { [key: string]: string }, xmlArray: any) {
    if (!xmlArray || !Array.isArray(xmlArray)) {
      return;
    }

    for (let prop of xmlArray) {
      if (typeof prop._ === 'string' &&
        prop.$ &&
        typeof prop.$.name === 'string') {

        let name = utils.makeSafeString(prop.$.name);
        let value = utils.makeSafeString(prop._);
        target[name] = value;
      }
    }
  }


  private fileExists(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.access(path, fs.F_OK, (err) => {
        resolve(!err);
      });
    });
  }


}
