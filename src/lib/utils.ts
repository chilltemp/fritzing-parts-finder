import * as fs from 'fs';
import * as xml2js from 'xml2js';
import * as htmlToText from 'html-to-text';

export function isSafeRelativePath(root: string, relative: string): boolean {
  if (!relative) {
    return true;
  }

  // TODO: BETTER!!
  return typeof relative === 'string' && relative.indexOf('..') === -1;
}

export function fileExistsAsync(path: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.access(path, fs.F_OK, (err) => {
      resolve(!err);
    });
  });
}

export function writeFileAsync(fileName: string, content: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, content, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function readFileAsync(fileName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf8', (err, content) => {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });
  });
}

export function convertFromXml(content: string): Promise<any> {
  return new Promise((resolve, reject) => {
    xml2js.parseString(content, { explicitArray: false }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export function makeSafeString(input: any): string {
  if (typeof input === 'undefined' || input === null || input === '') {
    return null;
  }

  if (typeof input !== 'string') {
    input = input.toString();
  }

  let options: HtmlToTextOptions = {
    hideLinkHrefIfSameAsText: true,
    wordwrap: null,
  };

  return htmlToText.fromString(input as string, options);
}
