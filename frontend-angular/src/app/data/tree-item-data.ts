import { ItemData } from './item-data.js';
import { TreeData } from './tree-data.js';

export class TreeItemData {
  public id!: string;
  public title!: string;
  public text!: string;
  public state!: string;
  public status!: string;
  public CRUDMode!: string;
  public children!: TreeItemData[];

  public convertToTreeData(): TreeData<ItemData> {
    return new TreeData(
      new ItemData(this.id, this.title, this.text, this.state, this.status, this.CRUDMode),
    );
  }
}
