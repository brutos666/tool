import { Data } from './data.js';

export class ItemData extends Data {
  constructor(
    id: string,
    public title: string,
    public text: string,
    public state: string,
    public status: string,
  ) {
    super(id);
  }

  override getData(): Object {
    return {
      id: this.id,
      title: this.title,
      text: this.text,
      state: this.state,
      status: this.status,
    };
  }
}
