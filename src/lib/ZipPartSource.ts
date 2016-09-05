import { FritzingPart } from './FritzingPart';
import { PartSource, ImageLoadStyle } from './PartSource';
import { IPartsFinderSource } from './interfaces.ts';
import * as utils from './utils';
import * as glob from 'glob';
import * as fs from 'fs';
import * as JSZip from 'jszip';

export class ZipPartSource extends PartSource {
  constructor(src: IPartsFinderSource, target: string) {
    super(src, target);
  }


  public async fetchSourceAsync(): Promise<any> {
    throw new Error('Not implimented');
  }

  public findPartFilesAsync(): Promise<[string]> {
    throw new Error('Not implimented');
  }

  public async readPartAsync(fileName: string): Promise<FritzingPart> {
    throw new Error('Not implimented');
  }

  protected async readImageAsync(partFileName: string, imageFileName: string): Promise<string> {
    throw new Error('Not implimented');
  }

  public async readFzpzAsync(fileName: string): Promise<FritzingPart> {
    let files = await this.unzipToStringsAsync(fileName);
    console.log('====================================');
    console.log(fileName);
    console.log(JSON.stringify(files, null, 2));
    return null;
  }

  private readFileAsync(fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(fileName, (err, content) => {
        if (err) {
          reject(err);
        } else {
          resolve(content);
        }
      });
    });
  }
  private unzipToStringsAsync(fileName: string): Promise<{ [key: string]: string }> {
    return utils.readFileAsync(fileName)
      .then((data) => {
        let zip = new JSZip();
        return zip.loadAsync(data);
      })
      .then((zip) => {
        let files: { [key: string]: string } = {};
        zip.forEach((relPath, zipFile) => {
          files[relPath] = zipFile.name;
        });

        return files;
      });
  }
}
