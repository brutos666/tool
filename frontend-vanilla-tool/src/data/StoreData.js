import DragDropCenter from '../components/DragDropCenter.js';
import NotificationCenter from '../components/NotificationCenter.js';
import UserCallsRequest from '../requests/UserCallsRequest.js';
import { ROOT_ID } from '../tools/Constants.js';
import TreeItem from './TreeItem.js';
import User from './User.js';
/** @import {ItemInfos} from './TreeItem.js'; */
/** @import {LoggedUser} from './User.js'; */
/** @import {SpaceView} from '../components/views/SpaceView.js'; */
/** @import Tree from '../components/decorators/Tree.js'; */
/** @import WorkingSpace from '../components/WorkingSpace.js'; */

class StoreData {

  static state = {
    user: null,
    treeItem: null,
    treeItemLastId: 0,
    currentSpace: null,
    currentTree: null,
    notificationCenter: null,
    dragDropCenter: null,
    workSpace: null
  };

  static async init() {
    this.state.treeItem = new TreeItem({ id: ROOT_ID, title: 'Racine', state: 'TODO', children: [] });
    this.state.currentSpace = null;
    this.state.currentTree = null;
    this.state.notification_center = new NotificationCenter();
    this.state.drag_drop_center = new DragDropCenter();
    document.body.appendChild(this.state.notification_center.getElementView());
    document.body.appendChild(this.state.drag_drop_center.getElementView());
    // Appeler le service /refresh pour récupérer les informations sur l'utilisateur connecté dont le jeton d'authentification après redirection
    return new UserCallsRequest().refreshToken.call()
      .then(loggedUser => this.refreshUser(loggedUser), () => this.logout());
  }

  static refreshUser(loggedUser) {
    this.state.user = new User(loggedUser);
  }

  static login(loggedUser) {
    this.state.user = new User(loggedUser);
    window.location.href = 'index.html';
  }

  static logout() {
    window.location.href = 'login.html';
  }

  static logPageInit() {
    this.state.notification_center = new NotificationCenter();
    document.body.appendChild(this.state.notification_center.getElementView());
  }

  /** @returns {LoggedUser} */
  static getUser() {
    return this.state.user;
  }

  /** @returns {TreeItem} */
  static getTreeItem() {
    return this.state.treeItem;
  }

  static giveTreeItemNewId() {
    if (this.state.treeItemLastId === undefined) {
      this.state.treeItemLastId = 0;
    }
    return String(this.state.treeItemLastId++);
  }

  /** @returns {WorkingSpace} */
  static getWorkingSpace() {
    return this.state.workSpace;
  }

  static setWorkingSpace(workingSpace) {
    this.state.workSpace = workingSpace;
  }

  /** @returns {NotificationCenter} */
  static getNotificationCenter() {
    return this.state.notification_center;
  }

  /** @returns {DragDropCenter} */
  static getDragDropCenter() {
    return this.state.drag_drop_center;
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

  /**
   * Positionne l'espace courant
   * @param {SpaceView} space : vue de l'espace
   */
  static setCurrentSpace(space) {
    this.state.currentSpace = space;
  }

  /**
   * Retourne l'espace courant
   * @returns {SpaceView}
   */
  static getCurrentSpace() {
    return this.state.currentSpace;
  }

  /**
   * Positionne l'arbre courant
   * @param {Tree} currentTree : arbre
   */
  static setCurrentTree(currentTree) {
    this.state.currentTree?.removeCurrentTree();
    this.state.currentTree = currentTree;
    currentTree.setCurrentTree();

    this.getWorkingSpace()
      .setCurrentTreeItem(currentTree.getTreeItem());
  }
  static removeCurrentTree() {
    this.state.currentTree?.removeCurrentTree();
    this.state.currentTree = null;

    this.getWorkingSpace()
      .setCurrentTreeItem(null);
  }
  /**
   * Retourne l''arbre courant
   * @returns {Tree}
   */
  static getCurrentTree() {
    return this.state.currentTree;
  }
  /**
   * Retourne l'item de l'arbre courant
   * @returns {TreeItem}
   */
  static getCurrentTreeItem() {
    return this.state.currentTree?.getTreeItem();
  }

}

export default StoreData;