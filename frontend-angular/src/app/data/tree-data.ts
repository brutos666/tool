import { Data } from './data.js';

export class TreeData<T extends Data> {
  private children: Array<TreeData<T>> = [];
  private treeItemId: string = '0';
  private treeParentItemId: string = '';

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
  replaceChild(toReplace: TreeData<T>, replaceBy: TreeData<T>) {
    this.children.splice(this.children.indexOf(toReplace), 1, replaceBy);
  }

  getPrevious(child: TreeData<T>): TreeData<T> | null {
    const children = this.getChildren();
    const index = children.indexOf(child);
    if (index === 0) {
      return null;
    }
    return children[index - 1];
  }
  getNext(child: TreeData<T>): TreeData<T> | null {
    const children = this.getChildren();
    const index = children.indexOf(child);
    if (index === this.children.length - 1) {
      return null;
    }
    return children[index + 1];
  }

  getTreeByTreeId(treeItemId: string): TreeData<T> | null {
    if (treeItemId === this.treeItemId) {
      return this;
    }
    for (const treeChild of this.getChildren()) {
      const found = treeChild.getTreeByTreeId(treeItemId);
      if (found) {
        return found;
      }
    }
    return null;
  }
  getTreeByItemId(itemId: string): TreeData<T> | null {
    if (itemId === this.getItemId()) {
      return this;
    }
    for (const treeChild of this.getChildren()) {
      const found = treeChild.getTreeByItemId(itemId);
      if (found) {
        return found;
      }
    }
    return null;
  }
}
