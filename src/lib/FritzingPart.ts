
export class FritzingPart {
  public version: string;
  public author: string;
  public title: string;
  public label: string;
  public date: string;
  public tags: [string];
  public description: string;
  public properties: { [key: string]: string };
  public views: {[key: string]: PartView};

  constructor() {
    this.tags = [] as [string];
    this.properties = {} as { [key: string]: string };
  }
}

export class PartView {
  public fileName: string;
  public layers: [string];

  constructor() {
    this.layers = [] as [string];
  }
}
