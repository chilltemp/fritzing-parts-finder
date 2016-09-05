import * as path from 'path';
import * as glob from 'glob';
import * as fs from 'fs';
import * as utils from './utils';
import * as URI from 'urijs';
import { IPartsFinderSource } from './interfaces.ts';
import { FritzingPart, PartView } from './FritzingPart';

export interface IPartSource {
  name: string;
  targetPath: string;
  url: string;
  fetchSourceAsync(): Promise<any>;
  findPartFilesAsync(): Promise<[string]>;
  readPartAsync(fileName: string): Promise<FritzingPart>;
}

export abstract class PartSource implements IPartSource {
  // public static create(src: IPartsFinderSource, target: string): IPartSource {
  // }

  public name: string;
  public targetPath: string;
  public url: string;
  protected partsPattern: string;
  protected svgPath: string;

  constructor(src: IPartsFinderSource, target: string) {
    this.name = src.name;
    this.url = src.url;
    this.svgPath = src.svgPath;
    this.targetPath = target;

    this.partsPattern = src.partsPath
      ? path.join(target, src.partsPath, '**/*.fz*')
      : path.join(target, '**/*.fz*');

    if (src.svgPath && !utils.isSafeRelativePath(target, src.svgPath)) {
      throw new Error('Invalid svgPath!');
    }
  }

  public abstract async fetchSourceAsync(): Promise<any>;
  public abstract findPartFilesAsync(): Promise<[string]>;
  public abstract async readPartAsync(fileName: string): Promise<FritzingPart>;

  public async loadImagesAsync(fileName: string, part: FritzingPart): Promise<void> {
    for (let key in part.views) {
      if (part.views.hasOwnProperty(key) && part.views[key].fileName) {
        let image = await this.readImageAsync(fileName, part.views[key].fileName);

        if (image) {
          part.views[key].image = image;
        }
      }
    }
  }

  protected abstract async readImageAsync(partFileName: string, imageFileName: string): Promise<string>;


  protected async parsePartXml(xml: string): Promise<FritzingPart> {
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

    if (source.module.tags && source.module.tags.tag) {
      this.loadStringsFromXml(part.tags, source.module.tags.tag);
    }

    if (source.module.properties && source.module.properties.property) {
      this.loadNameValuesFromXml(part.properties, source.module.properties.property);
    }

    if (source.module.views) {
      for (let key in source.module.views) {
        if (source.module.views.hasOwnProperty(key) && source.module.views[key].layers) {
          part.views[key] = this.readViewFromXml(source.module.views[key].layers);
        }
      }
    }

    return part;
  }

  private readViewFromXml(xml: any): PartView {
    let view = new PartView();
    if (!xml.$ || !xml.$.image || !utils.isSafeRelativePath(this.targetPath, xml.$.image)) {
      throw new Error('Missing or invalid image.');
    }

    view.fileName = xml.$.image;

    if (xml.layer) {
      if (Array.isArray(xml.layer)) {
        for (let layer of xml.layer) {
          if (layer.$ && typeof layer.$.layerId === 'string') {
            view.layers.push(layer.$.layerId);
          }
        }
      } else {
        view.layers.push(xml.layer.$.layerId);
      }
    }

    return view;
  }

  private loadStringsFromXml(target: [string], xmlArray: any) {
    if (!xmlArray || !Array.isArray(xmlArray)) {
      return;
    }

    for (let tag of xmlArray) {
      target.push(utils.makeSafeString(tag));
    }
  }

  private loadNameValuesFromXml(target: { [key: string]: string }, xmlArray: any) {
    if (!xmlArray || !Array.isArray(xmlArray)) {
      return;
    }

    for (let prop of xmlArray) {
      if (typeof prop._ === 'string' &&
        prop.$ &&
        typeof prop.$.name === 'string') {

        let name = utils.makeSafeString(prop.$.name);
        let value = utils.makeSafeString(prop._);
        target[name] = value;
      }
    }
  }

}
