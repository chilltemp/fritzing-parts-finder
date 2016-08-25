import * as path from 'path';
import * as glob from 'glob';
import * as simpleGit from 'simple-git';
import * as fs from 'fs';
import { ISourceDef } from './interfaces.ts';

export class PartSource {
  public name: string;
  public url: string;
  public target: string;

  constructor(src: ISourceDef, target: string) {
    this.name = src.name;
    this.url = src.url;
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
      let pattern = path.join(this.target, '**/*.fz*');
      glob(pattern, (err, matches) => {
        if (err) {
          reject(err);
        } else {
          resolve(matches);
        }
      });
    });
  }

  private fileExists(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.access(path, fs.F_OK, (err) => {
        resolve(!err);
      });
    });
  }


}
