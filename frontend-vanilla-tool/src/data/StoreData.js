import DragDropCenter from '../components/DragDropCenter.js';
import NotificationCenter from '../components/NotificationCenter.js';
import { ROOT_ID } from '../tools/Constants.js';
import TreeItem from './TreeItem.js';
import User from './User.js';
/** @import {ItemInfos} from './TreeItem.js'; */
/** @import {SpaceView} from '../components/views/SpaceView.js'; */

class StoreData {

  static init() {
    window._treeItem = new TreeItem({ id: ROOT_ID, title: 'Racine', state: 'TODO', children: [] });
    window._currentSpace = null;
    window._notification_center = new NotificationCenter();
    window._drag_drop_center = new DragDropCenter();
    document.body.appendChild(window._notification_center.getElementView());
    document.body.appendChild(window._drag_drop_center.getElementView());
  }

  static logPageInit() {
    window._notification_center = new NotificationCenter();
    document.body.appendChild(window._notification_center.getElementView());
  }

  /** @returns {TreeItem} */
  static getTreeItem() {
    return window._treeItem;
  }

  static giveTreeItemNewId() {
    if (window._treeItemLastId === undefined) {
      window._treeItemLastId = 0;
    }
    return String(window._treeItemLastId++);
  }

  /** @returns {NotificationCenter} */
  static getNotificationCenter() {
    return window._notification_center;
  }

  /** @returns {DragDropCenter} */
  static getDragDropCenter() {
    return window._drag_drop_center;
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
      .addItem(treeItem, new TreeItem(itemInfos));
  }

  static storeUser(userInfos) {
    window._user = new User(userInfos);
  }

  /**
   * Positionne l'espace courant
   * @param {SpaceView} space : vue de l'espace
   */
  static setCurrentSpace(space) {
    window._currentSpace = space;
  }

  /**
   * Retourne l'espace courant
   * @returns {SpaceView}
   */
  static getCurrentSpace() {
    return window._currentSpace;
  }

}

export default StoreData;