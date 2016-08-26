import * as fs from 'fs';
import * as xml2js from 'xml2js';

export function writeFileAsync(fileName: string, content:string): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, content, (err) => {
      if(err) {
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
    xml2js.parseString(content, { explicitArray: false}, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
