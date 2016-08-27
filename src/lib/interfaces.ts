export interface IPartsFinderConfig {
  tempPath: string;
  outputPath: string;
  sources: [IPartsFinderSource];
}

export interface IPartsFinderSource {
  name: string;
  url: string;
  partsPath: string;
  svgPath: string;
}

