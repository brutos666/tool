import { TreeItemData } from './tree-item-data.js';

export class TreeInfoData {
  public item!: TreeItemData;
  public previousItemId: string = '';
  public parentItemId: string = '';
  public nextItemId: string = '';
}
