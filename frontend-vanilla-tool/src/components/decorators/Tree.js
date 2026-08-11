import { RIGHT } from '../../tools/Constants.js';
import ActionButton from '../ActionButton.js';
import TreeList from '../TreeList.js';
import ItemDecorator from './ItemDecorator.js';
import TreeView from './views/TreeView.js';
/** @import Component from '../Component.js'; */
/** @import TreeItem from '../../data/TreeItem.js'; */
/** @import TreeFocusManager from '../TreeFocusManager.js'; */

class Tree extends ItemDecorator {

  name = 'Tree';

  /** @type {TreeItem} */
  #treeItem;

  /** @type {TreeList} */
  #treeList = null;
  /** @type {ActionButton} */
  #toggleButton = null;

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
    this.setTreeItemId(data.treeItem.getTreeItemId());

    const rights = data.rights;
    if (!rights.includes(RIGHT.update)) {
      this.setReadOnly();
    }

    this.#toggleButton = new ActionButton({ id: 'toggle', label: 'Ouvrir/Fermer le noeud', type: 'icon', icon: '', role: 'none' });
    this.#toggleButton.setDoActionCallback(() => {
      this.setOpen(!this.isOpened());
    });
    this.setStaticChild('toggle', this.#toggleButton);

    this.#treeList = new TreeList(false, data.treeItem, data.layout);
    this.setStaticChild('treeList', this.#treeList);

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
  isOpened() {
    /** @type {TreeView} */
    const view = this.getView();
    return view.isOpened();
  }
  isClosed() {
    /** @type {TreeView} */
    const view = this.getView();
    return view.isClosed();
  }

  setLeaf(leaf) {
    /** @type {TreeView} */
    const view = this.getView();
    view.setLeaf(leaf);
    if (leaf) {
      this.#toggleButton.setDisabled();
    } else {
      this.#toggleButton.setEnabled();
    }
  }
  isLeaf() {
    /** @type {TreeView} */
    const view = this.getView();
    return view.isLeaf();
  }

  setRoot() {
    /** @type {TreeView} */
    const view = this.getView();
    view.setRoot();
  }
  setTreeItemId(treeItemId) {
    /** @type {TreeView} */
    const view = this.getView();
    view.setTreeItemId(treeItemId);
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