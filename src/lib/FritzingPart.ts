
export class FritzingPart {
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
