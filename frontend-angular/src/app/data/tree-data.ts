import { Data } from './data.js';

export class TreeData<T extends Data> {
  private children: Array<TreeData<T>> = [];
  private treeItemId: string = '0';
  private treeParentItemId: string = '0';

  constructor(private content: T) {}

  copy(): TreeData<T> {
    const copy = new TreeData(this.getContent().clone() as T);
    copy.setChildren([...this.getChildren()]);
    copy.setTreeItemId(this.getTreeItemId());
    copy.setParentTreeItemId(this.getParentTreeItemId());
    return copy;
  }

  getItemId(): string {
    return this.content.id;
  }

  getTreeItemId(): string {
    return this.treeItemId;
  }
  setTreeItemId(id: string) {
    this.treeItemId = id;
  }
  getParentTreeItemId(): string {
    return this.treeParentItemId;
  }
  setParentTreeItemId(id: string) {
    this.treeParentItemId = id;
  }

  getContent(): T {
    return this.content;
  }

  setContent(content: T) {
    this.content = content;
  }
  getData(): Object {
    return Object.assign(this.content.getData(), {
      children: this.children.map((child) => child.getData()),
    });
  }

  addChild(tree: TreeData<T>) {
    this.children.push(tree);
  }
  removeChild(tree: TreeData<T>) {
    const index = this.getChildren().findIndex(
      (treeChild) => treeChild.getTreeItemId() === tree.getTreeItemId(),
    );
    if (index >= 0) {
      this.getChildren().splice(index, 1);
    }
  }

  getChildren(): Array<TreeData<T>> {
    return this.children;
  }

  setChildren(children: TreeData<T>[]) {
    this.children = children;
  }

  getChildByTreeItemId(treeItemId: string): TreeData<T> | undefined {
    if (treeItemId === this.treeItemId) {
      return this;
    }
    return this.getChildren().find((child) => child.getChildByTreeItemId(treeItemId));
  }
}
