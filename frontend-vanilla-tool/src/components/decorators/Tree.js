import TreeList from '../TreeList.js';
import TreeView from './views/TreeView.js';
import Decorator from './Decorator.js';
import { RIGHT } from '../../tools/Constants.js';
/** @import Component from '../Component.js'; */
/** @import TreeItem from '../../data/TreeItem.js'; */

class Tree extends Decorator {

  name = 'Tree';

  /** @type {TreeItem} */
  #treeItem;

  /**
   * @constructor
   * @param {Component} decoratedElement
   * @param {Object} data
   * @param {TreeItem} data.treeItem
   * @param {ITEM_LAYOUT} data.layout
   * @param {Array<RIGHT>} data.rights - Droits en création, modification et suppression
   */
  constructor(decoratedElement, data) {
    super(new TreeView(decoratedElement.getView()), decoratedElement);
    this.#treeItem = data.treeItem;
    this.#treeItem.addObserver(this, data.rights);

    const rights = data.rights;
    if (!rights.includes(RIGHT.update)) {
      this.setReadOnly();
    }

    const treeList = new TreeList(false, data.treeItem, data.layout);
    this.setStaticChild('treeList', treeList);

    this.setOpen(false);
    this.setLeaf(this.#treeItem.isLeaf());
    if (this.#treeItem.isRoot()) {
      this.setRoot();
    }
  }

  setOpen(open) {
    /** @type {TreeView} */
    const view = this.getView();
    view.setOpen(open);
  }

  setLeaf(leaf) {
    /** @type {TreeView} */
    const view = this.getView();
    view.setLeaf(leaf);
  }

  setRoot() {
    /** @type {TreeView} */
    const view = this.getView();
    view.setRoot();
  }

  /**
   * Modification du modèle
   * @param {'update'|'updated'|'toDelete'|'addItem'|'removeItem'} action
   * @param {TreeItem} treeItem
   */
  update(action, treeItem) {
    if (action === 'addItem') {
      this.setLeaf(treeItem.isLeaf());
      this.setOpen(true);
    } else if (action === 'removeItem') {
      this.setLeaf(treeItem.isLeaf());
    }
  }

  destroy() {
    this.#treeItem.removeObserver(this);
    super.destroy();
  }

}

export default Tree;