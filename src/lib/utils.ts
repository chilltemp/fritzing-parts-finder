import * as fs from 'fs';
import * as xml2js from 'xml2js';

export function readFileAsync(fileName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, null, (err, content) => {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });
  });
}

export async function readXmlFileAsync(fileName: string): Promise<any> {
  let content = await readFileAsync(fileName);
  return await convertFromXml(content);
}

function convertFromXml(content: string): Promise<any> {
  return new Promise((resolve, reject) => {
    xml2js.parseString(content, null, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
