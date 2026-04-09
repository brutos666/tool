import TreeItem from './TreeItem.js';
/** @import {ItemInfos} from './TreeItem.js'; */

class StoreData {

  static init() {
    window._treeItem = new TreeItem({ id: -1, title: 'Racine', state: 'TODO', children: [] });
  }
  /** @returns {TreeItem} */
  static getTreeItem() {
    return window._treeItem;
  }

  /**
   * @param {Array<ItemInfos>} itemInfosList
   */
  static storeItems(itemInfosList) {
    const treeItem = StoreData.getTreeItem();
    treeItem.getTreeItemList()
      .setItems(treeItem, itemInfosList);
  }

  static addRootItem(itemInfos) {
    const treeItem = StoreData.getTreeItem();
    treeItem.getTreeItemList()
      .addItem(treeItem, itemInfos);
  }

}

export default StoreData;