import * as utils from './utils';

export class FritzingPart {
  public static async fromFile(fileName: string): Promise<FritzingPart> {
    let src = await utils.readXmlFileAsync(fileName);
    return new FritzingPart(src);
  }


  public version: number;
  public author: string;
  public title: string;
  public label: string;
  public date: Date;
  public tags: [string];
  public description: string;

  constructor(copyFrom?: any) {
    this.tags = [] as [string];

    if (copyFrom) {
      this.version = copyFrom.version;
      this.title = copyFrom.title;
      this.label = copyFrom.label;
      this.date = copyFrom.date;
      this.description = copyFrom.description;

      if (copyFrom.tags && Array.isArray(copyFrom.tags)) {
        this.tags = copyFrom.tags.slice(0);
      }
    }
  }
}
