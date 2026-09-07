export class Data {
  constructor(public id: string) {}

  getData(): Object {
    return { id: this.id };
  }

  getId(): string {
    return this.id;
  }
}
