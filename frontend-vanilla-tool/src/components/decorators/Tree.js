import TreeList from '../TreeList.js';
import TreeView from './views/TreeView.js';
import Toolbar from '../Toolbar.js';
import ActionButton from '../ActionButton.js';
import Decorator from './Decorator.js';
/** @import Component from '../Component.js'; */
/** @import TreeItem from '../../data/TreeItem.js'; */

class Tree extends Decorator {

  name = 'Tree';

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
   */
  constructor(decoratedElement, data) {
    super(new TreeView(decoratedElement.getView(), { leaf: data.treeItem.isLeaf() }), decoratedElement);
    this.#treeItem = data.treeItem;

    const toolbar = new Toolbar();
    this.#addAction = new ActionButton({ id: 'addNewChild', label: '+' });
    this.#addAction.setDoActionCallback(this.addNewChild.bind(this));
    toolbar.addChild(this.#addAction);
    this.#deleteAction = new ActionButton({ id: 'delete', label: 'X' });
    this.#deleteAction.setDoActionCallback(this.doDelete.bind(this));
    toolbar.addChild(this.#deleteAction);
    this.setStaticChild('toolbar', toolbar);

    this.#treeList = new TreeList(data.treeItem.getTreeItemList(), data.layout);
    this.setStaticChild('treeList', this.#treeList);
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
    const isLeaf = this.#treeItem.isLeaf();
    if (isLeaf) {
      this.updateData({ leaf: true });
      if (this.#treeItem.isRoot()) {
        this.setRoot();
      }
    }
    this.setOpen();
    this.#treeItem.addItem({ title: 'Nouvel item', state: 'TODO', children: [] });
  }

  doDelete() {
    this.#treeItem.deleteItem();
  }

  setOpen() {
    this.getView()
      .setOpen();
  }

  setRoot() {
    this.getView()
      .setRoot();
  }

}

export default Tree;