import TreeItem from './TreeItem.js';
import NotificationCenter from '../components/NotificationCenter.js';
/** @import {ItemInfos} from './TreeItem.js'; */

class StoreData {

  static init() {
    window._treeItem = new TreeItem({ id: -1, title: 'Racine', state: 'TODO', children: [] });
    window._currentSpace = null;
    window._notification_center = new NotificationCenter();
    document.body.appendChild(window._notification_center.getElementView());
  }
  /** @returns {TreeItem} */
  static getTreeItem() {
    return window._treeItem;
  }

  /** @returns {NotificationCenter} */
  static getNotificationCenter() {
    return window._notification_center;
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

  static setCurrentSpace(space) {
    window._currentSpace = space;
  }

  static getCurrentSpace() {
    return window._currentSpace;
  }

}

export default StoreData;