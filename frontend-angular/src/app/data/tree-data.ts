import { Data } from './data.js';

export class TreeData<T extends Data> {
  private children: Array<TreeData<T>> = [];

  constructor(private content: T) {}

  getId() {
    return this.content.id;
  }
  getContent() {
    return this.content;
  }
  getData(): Object {
    return {
      children: this.children.map((child) => child.getData()),
      content: this.content.getData(),
    };
  }

  addChild(content: TreeData<T>) {
    this.children.push(content);
  }

  getChildren(): Array<TreeData<T>> {
    return this.children;
  }

  setChildren(children: TreeData<T>[]) {
    this.children = children;
  }
}
