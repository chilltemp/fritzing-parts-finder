export interface IConfig {
  localPath: string;
  sources: [ISourceDef];
}

export interface ISourceDef {
  name: string;
  url: string;
}
