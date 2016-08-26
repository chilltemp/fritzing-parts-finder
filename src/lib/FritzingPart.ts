import * as utils from './utils';

export class FritzingPart {
  public static async fromFile(fileName: string): Promise<FritzingPart> {
    let content = await utils.readFileAsync(fileName);
    return await FritzingPart.fromXml(content);
  }

  public static async fromXml(xml: string): Promise<FritzingPart> {
    let source = await utils.convertFromXml(xml);
    let part = new FritzingPart();

    if (!source || !source.module) {
      throw new Error('Source is null or missing its root.');
    }

    part.version = utils.makeSafeString(source.module.version);
    part.title = utils.makeSafeString(source.module.title);
    part.label = utils.makeSafeString(source.module.label);
    part.date = utils.makeSafeString(source.module.date);
    part.description = utils.makeSafeString(source.module.description);

    if (source.module.tags &&
      source.module.tags.tag &&
      Array.isArray(source.module.tags.tag)) {

      for (let tag of source.module.tags.tag) {
        part.tags.push(utils.makeSafeString(tag));
      }
    }

    if (source.module.properties &&
      source.module.properties.property &&
      Array.isArray(source.module.properties.property)) {

      for (let prop of source.module.properties.property) {
        if (typeof prop._ === 'string' &&
          prop.$ &&
          typeof prop.$.name === 'string') {

          let name = utils.makeSafeString(prop.$.name);
          let value = utils.makeSafeString(prop._);
          part.properties[name] = value;
        }
      }
    }

    return part;
  }

  public version: string;
  public author: string;
  public title: string;
  public label: string;
  public date: string;
  public tags: [string];
  public description: string;
  public properties: { [key: string]: string };

  constructor() {
    this.tags = [] as [string];
    this.properties = {} as { [key: string]: string };
  }
}
