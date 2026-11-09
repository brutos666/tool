import StoreData from './StoreData.js';
import TreeItem from './TreeItem.js';
/** @import {ItemInfos} from './TreeItem.js'; */

class TreeItemList {

  name = 'TreeItemList';

  /** @type {Array<TreeItem>} */
  #treeList = [];
  #observers = [];

  /** @type {TreeItem} */
  #parent;

  /**
   * @constructor
   */
  constructor() {
  }
  setParent(parent) {
    this.#parent = parent;
  }
  getParent() {
    return this.#parent;
  }
  getItemInfos() {
    return this.#treeList.map(treeItem => treeItem.getItemInfos());
  }

  /**
   *
   * @returns {Array<TreeItem>}
   */
  getTreeList() {
    return this.#treeList;
  }

  setItems(parentTreeItem, itemInfosList) {
    this.#treeList = [];
    itemInfosList.forEach(itemInfos => {
      const treeItem = new TreeItem(itemInfos);
      treeItem.setParentItem(parentTreeItem);
      this.#treeList.push(treeItem);
    });
    this.alertObservers('replaceAll', this.getTreeList());
  }

  addItems(parentTreeItem, itemInfosList) {
    itemInfosList.forEach(itemInfos => {
      const treeItem = new TreeItem(itemInfos);
      this.addItem(parentTreeItem, treeItem);
    });
  }

  addItem(parentTreeItem, treeItem) {
    treeItem.setParentItem(parentTreeItem);
    this.#treeList.push(treeItem);
    this.alertObservers('add', [treeItem]);
    treeItem.alertObservers('added');
  }

  addItemAtIndex(parentTreeItem, treeItem, index) {
    treeItem.setParentItem(parentTreeItem);
    this.#treeList.splice(index, 0, treeItem);
    this.alertObservers('add', [treeItem], index);
    treeItem.alertObservers('added');
  }

  /**
   * Suppression d'un item
   * @param {TreeItem} treeItemToRemove - Item à supprimer
   */
  removeItem(treeItemToRemove) {
    const index = this.#treeList.findIndex(treeItem => treeItem === treeItemToRemove);
    if (index === -1) {
      return;
    }
    if (treeItemToRemove === StoreData.getCurrentTreeItem()) {
      StoreData.removeCurrentTree();
    }
    treeItemToRemove.alertObservers('removed');
    this.alertObservers('remove', [treeItemToRemove]);
    this.#treeList.splice(index, 1);
  }

  getIndex(treeItem) {
    return this.#treeList.findIndex(item => item === treeItem);
  }

  getPrevious(treeItem) {
    const index = this.getIndex(treeItem);
    if (index === 0) {
      return null;
    }
    return this.#treeList[index - 1];
  }

  getNext(treeItem) {
    const index = this.getIndex(treeItem);
    if (index === this.#treeList.length - 1) {
      return null;
    }
    return this.#treeList[index + 1];
  }

  getById(id) {
    return this.#treeList.find(treeItem => treeItem.getItemId() === id);
  }

  getLast() {
    return this.#treeList[this.#treeList.length - 1];
  }
  /**
   * Indiquer aux observateurs qu'une modification a eu lieu
   * @param {'remove'|'add'|'replaceAll'} action
   * @param {Array<TreeItem>} treeItemList
   * @param {number|undefined} index
   */
  alertObservers(action, treeItemList, index) {
    /*
     * NOTE : La liste des observers peut être modifiée si par exemple on alerte de la suppression d'un item
     * On va donc travailler sur une copie
     */
    const observers = this.#observers.slice();
    for (const observer of observers) {
      observer.update(action, treeItemList, index);
    }
  }

  addObserver(observer) {
    this.#observers.push(observer);
  }

  removeObserver(observer) {
    const index = this.#observers.indexOf(observer);
    if (index !== -1) {
      this.#observers.splice(index, 1);
    }
  }

}

export default TreeItemList;