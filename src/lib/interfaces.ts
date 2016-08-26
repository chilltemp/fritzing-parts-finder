export interface IConfig {
  tempPath: string;
  outputPath: string;
  sources: [ISourceDef];
}

export interface ISourceDef {
  name: string;
  url: string;
}
