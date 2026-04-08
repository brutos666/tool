import TreeItemList from './TreeItemList.js';
/** @import {ItemInfos} from './TreeItem.js'; */

class StoreData {

  static init() {
    window._treeItems = new TreeItemList([]);
  }

  /** @returns {TreeItemList} */
  static getTreeItems() {
    return window._treeItems;
  }

  /**
   * @param {Array<ItemInfos>} itemInfosList
   */
  static storeItems(itemInfosList) {
    StoreData.getTreeItems()
      .setItems(itemInfosList);
  }

  static addRootItem(itemInfos) {
    StoreData.getTreeItems()
      .addItem(itemInfos);
  }

}

export default StoreData;