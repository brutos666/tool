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
      treeItem.setParentItem(parentTreeItem);
      this.#treeList.push(treeItem);
      this.alertObservers('add', [treeItem]);
    });
  }

  addItem(parentTreeItem, itemInfos) {
    const treeItem = new TreeItem(itemInfos);
    treeItem.setParentItem(parentTreeItem);
    this.#treeList.push(treeItem);
    this.updatePrevious(treeItem);
    this.alertObservers('add', [treeItem]);
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
    this.#treeList.splice(index, 1);
    if (index > 0) {
      if (index === this.#treeList.length) {
        this.updateLast();
      } else {
        this.updatePrevious(this.#treeList[index]);
      }
    }
    this.alertObservers('remove', [treeItemToRemove]);
    treeItemToRemove.alertObservers('deleted');
  }

  getPrevious(treeItem) {
    const index = this.#treeList.findIndex(item => item === treeItem);
    if (index === 0) {
      return null;
    }
    return this.#treeList[index - 1];
  }

  updatePrevious(currentTreeItem) {
    const previousItem = this.getPrevious(currentTreeItem);
    if (previousItem) {
      previousItem.setPropertyValue('nextId', currentTreeItem.getItemId());
    }
  }
  getLast() {
    return this.#treeList[this.#treeList.length - 1];
  }
  updateLast() {
    const lastItem = this.getLast();
    lastItem.setPropertyValue('nextId', null);
  }
  /**
   * Indiquer aux observateurs qu'une modification a eu lieu
   * @param {'remove'|'add'|'replaceAll'} action
   * @param {Array<TreeItem>} treeItemList
   */
  alertObservers(action, treeItemList) {
    for (const observer of this.#observers) {
      observer.update(action, treeItemList);
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