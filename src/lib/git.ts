import * as simpleGit from 'simple-git';
import * as path from 'path';


export function cloneAsync(target: string, sourceUrl: string): Promise<any> {
  return new Promise((resolve, reject) => {
    let git = simpleGit();
    git.clone(sourceUrl, target, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function pullAsync(target: string): Promise<any> {
  return new Promise((resolve, reject) => {
    let git = simpleGit(target);
    git.pull((err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function latestCommitAsync(target: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let git = simpleGit(path.dirname(target));
    let options = ['--simplify-by-decoration', '--max-count=1', target];

    git.log(options, (err: any, data: any) => {
      if (err) {
        reject(err);
      } else if (!data || !data.latest || !data.latest.hash) {
        console.log('Bad log data for:', target);
        console.log(data);
        reject(new Error('Missing commit log'));
      } else {
        resolve(data.latest.hash);
      }
    });
  });
}
