import * as utils from './utils';

export class FritzingPart {
  public static async fromFile(fileName: string): Promise<FritzingPart> {
    let content = await utils.readFileAsync(fileName);
    return await FritzingPart.fromXml(content);
  }

  public static async fromXml(xml: string): Promise<FritzingPart> {
    let source = await utils.convertFromXml(xml);
    let part = new FritzingPart();

    part.version = source.module.version;
    part.title = source.module.title;
    part.label = source.module.label;
    part.date = source.module.date;
    part.description = source.module.description;

    return part;
  }

  public version: number;
  public author: string;
  public title: string;
  public label: string;
  public date: Date;
  public tags: [string];
  public description: string;

  constructor() {
    this.tags = [] as [string];
  }
}
