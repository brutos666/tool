import TreeList from '../TreeList.js';
import TreeView from './views/TreeView.js';
import Toolbar from '../Toolbar.js';
import ActionButton from '../ActionButton.js';
import Decorator from './Decorator.js';
import { RIGHT } from '../../tools/Constants.js';
/** @import Component from '../Component.js'; */
/** @import TreeItem from '../../data/TreeItem.js'; */

class Tree extends Decorator {

  name = 'Tree';
  static EVENTS = { focus: 'treeItemFocus' };

  #treeList;

  #deleteAction;
  #addAction;

  /** @type {TreeItem} */
  #treeItem;

  /**
   * @constructor
   * @param {Component} decoratedElement
   * @param {Object} data
   * @param {TreeItem} data.treeItem
   * @param {VIEW_CHOICE} data.layout
   * @param {Array<RIGHT>} data.rights - Droits en création, modification et suppression
   */
  constructor(decoratedElement, data) {
    super(new TreeView(decoratedElement.getView()), decoratedElement);
    this.#treeItem = data.treeItem;
    this.#treeItem.addObserver(this, data.rights);

    this.getView()
      .setOnFocusCallback(() => {
        this.getView()
          .dispatchEvent(new CustomEvent(Tree.EVENTS.focus, { bubbles: true, detail: this.#treeItem }));
      });

    const rights = data.rights;
    if (!rights.includes(RIGHT.update)) {
      this.setReadOnly();
    }
    const toolbar = new Toolbar();
    if (rights.includes(RIGHT.create)) {
      this.#addAction = new ActionButton({ id: 'addNewChild', label: '+' });
      this.#addAction.setDoActionCallback(this.addNewChild.bind(this));
      toolbar.addChild(this.#addAction);
    }
    if (rights.includes(RIGHT.delete)) {
      this.#deleteAction = new ActionButton({ id: 'delete', label: 'X' });
      this.#deleteAction.setDoActionCallback(this.doDelete.bind(this));
      toolbar.addChild(this.#deleteAction);
    }
    this.setStaticChild('toolbar', toolbar);

    this.#treeList = new TreeList(data.treeItem.getTreeItemList(), data.layout);
    this.setStaticChild('treeList', this.#treeList);

    this.setOpen(false);
    this.setLeaf(this.#treeItem.isLeaf());
    if (this.#treeItem.isRoot()) {
      this.setRoot();
    }
  }

  removeFromParent() {
    this.#treeItem.removeObserver(this);

    super.removeFromParent();
  }

  /**
   * @override
   * @returns {TreeView}
   */
  getView() {
    return super.getView();
  }

  getTreeItem() {
    return this.#treeItem;
  }

  getTreeList() {
    return this.#treeList;
  }

  addNewChild() {
    this.#treeItem.addItem({ title: 'Nouvel item', state: 'TODO', children: [] });
  }

  doDelete() {
    this.#treeItem.deleteItem();
  }

  setOpen(open) {
    this.getView()
      .setOpen(open);
  }

  setLeaf(leaf) {
    this.getView()
      .setLeaf(leaf);
  }

  setRoot() {
    this.getView()
      .setRoot();
  }

  setReadOnly() {
    this.getView()
      .setReadOnly();
  }

  /**
   * Modification du modèle
   * @param {'change'|'update'|'delete'|'addItem'|'removeItem'} action
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

}

export default Tree;