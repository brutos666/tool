import TreeList from '../TreeList.js';
import TreeView from './views/TreeView.js';
import ItemDecorator from './ItemDecorator.js';
import { RIGHT } from '../../tools/Constants.js';
/** @import Component from '../Component.js'; */
/** @import TreeItem from '../../data/TreeItem.js'; */

class Tree extends ItemDecorator {

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

    const rights = data.rights;
    if (!rights.includes(RIGHT.update)) {
      this.setReadOnly();
    }

    const treeList = new TreeList(false, data.treeItem, data.layout);
    this.setStaticChild('treeList', treeList);

    this.setLeaf(this.#treeItem.isLeaf());
    this.setOpen(false);
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
   * @param {'modify'|'added'|'updated'|'toDelete'|'undoToDelete'|'removed'|'addChildItem'|'removeChildItem'} action
   * @param {TreeItem} treeItem
   */
  update(action, treeItem) {
    super.update(action, treeItem);
    if (action === 'addChildItem') {
      this.setLeaf(false);
      this.setOpen(true);
    } else if (action === 'removeChildItem') {
      this.setLeaf(treeItem.isLeaf());
    }
  }

}

export default Tree;