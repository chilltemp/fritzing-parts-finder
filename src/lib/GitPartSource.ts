import { FritzingPart } from './FritzingPart';
import { PartSource } from './PartSource';
import { IPartsFinderSource } from './interfaces.ts';
import * as git from './git';
import * as utils from './utils';
import * as glob from 'glob';
import * as path from 'path';
import * as URI from 'urijs';

export class GitPartSource extends PartSource {
  constructor(src: IPartsFinderSource, target: string) {
    super(src, target);
  }

  public async fetchSourceAsync(): Promise<any> {
    let exists = await utils.fileExistsAsync(this.targetPath);

    if (exists) {
      return git.pullAsync(this.targetPath);
    } else {
      return git.cloneAsync(this.targetPath, this.url);
    }
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

  public async readPartAsync(fileName: string): Promise<FritzingPart> {
    let content = await utils.readFileAsync(fileName);
    let part = await this.parsePartXml(content);
    await this.loadImagesAsync(fileName, part);

    return part;
  }

  protected async readImageAsync(partFileName: string, imageFileName: string): Promise<string> {
    let filesToTry: [string] = [
      path.join(path.dirname(partFileName), imageFileName),
      path.join(this.targetPath, this.svgPath, imageFileName),
    ];

    for (let tryMe of filesToTry) {
      if (!(await utils.fileExistsAsync(tryMe))) {
        continue;
      }

      return this.getGitFileUrl(tryMe);
    }

    //throw new Error('Image not found: ' + imageFileName);
  }

private async getGitFileUrl(fileName: string): Promise<string> {
  let commit = await git.latestCommitAsync(fileName);
  let relPath = path.relative(this.targetPath, fileName);

  let uri = URI(this.url);
  let basePath = uri.path();
  relPath = path.join(basePath, commit, relPath);

  if (uri.domain() === 'github.com') {
    uri = uri.domain('cdn.rawgit.com');
  }

  return uri
    .path(relPath)
    .toString();
}}
