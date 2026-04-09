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
    for (const observer of this.#observers) {
      observer.update('replaceAll', this.getTreeList());
    }
  }

  addItem(parentTreeItem, itemInfos) {
    const treeItem = new TreeItem(itemInfos);
    treeItem.setParentItem(parentTreeItem);
    this.#treeList.push(treeItem);
    this.updatePrevious(treeItem);
    for (const observer of this.#observers) {
      observer.update('add', [treeItem]);
    }
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
    for (const observer of this.#observers) {
      observer.update('remove', [treeItemToRemove]);
    }
  }

  updatePrevious(currentTreeItem) {
    const index = this.#treeList.findIndex(treeItem => treeItem === currentTreeItem);
    if (index > 0) {
      const previousItem = this.#treeList[index - 1];
      previousItem.setPropertyValue('nextId', this.#treeList[index].getItemId());
    }
  }

  updateLast() {
    const lastItem = this.#treeList[this.#treeList.length - 1];
    lastItem.setPropertyValue('nextId', null);
  }

  addObserver(observer) {
    this.#observers.push(observer);
  }
  addObservers(observers) {
    this.#observers = observers;
  }

  removeObserver(observer) {
    const index = this.#observers.indexOf(observer);
    if (index !== -1) {
      this.#observers.splice(index, 1);
    }
  }
  removeObservers() {
    this.#observers = [];
  }

}

export default TreeItemList;