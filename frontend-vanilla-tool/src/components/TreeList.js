import Composite from './Composite.js';
import CommandItemDecorator from './decorators/CommandItemDecorator.js';
import Tree from './decorators/Tree.js';
import Item from './Item.js';
import TreeListView from './views/TreeListView.js';
import { RIGHT, VIEW_CHOICE } from '../tools/Constants.js';
/** @import TreeItem from '../data/TreeItem.js'; */
/** @import TreeItemList from '../data/TreeItemList.js'; */

class TreeList extends Composite {

  #itemLayout;
  /** @type {TreeItemList} */
  #treeItemList;

  /**
   *
   * @param {TreeItemList} treeItemList
   * @param {VIEW_CHOICE} itemLayout
   */
  constructor(treeItemList, itemLayout) {
    super(new TreeListView());
    this.#itemLayout = itemLayout;
    this.#treeItemList = treeItemList;
    this.addItems(treeItemList.getTreeList());

    treeItemList.addObserver(this);
  }
  getLayout() {
    return this.#itemLayout;
  }
  getTreeItemList() {
    return this.#treeItemList;
  }
  setTreeItemList(treeItemList) {
    this.#treeItemList.removeObserver(this);
    treeItemList.addObserver(this);
    this.#treeItemList = treeItemList;
    this.removeAllChildren();
    this.addItems(treeItemList.getTreeList());
    for (const tree of this.getChildren()) {
      tree.setRoot();
      tree.setOpen(true);
    }
  }

  /**
   * Modification du modèle
   * @param {string} action - Type d'action
   * @param {Array<TreeItem>} treeList
   */
  update(action, treeList) {
    if (action === 'replaceAll') {
      this.replaceAllItems(treeList);
    } else if (action === 'add') {
      this.addItems(treeList);
    }
  }
  /**
   * Replacement de tous les items
   * @param {Array<TreeItem>} treeList
   */
  replaceAllItems(treeList) {
    this.removeAllChildren();
    this.addItems(treeList);
  }
  /**
   * Ajout d'un ou plusieurs items
   * @param {Array<TreeItem>} treeList
   */
  addItems(treeList) {
    const itemRights = this.getLayout() === VIEW_CHOICE.Tree ? [] : [ RIGHT.create, RIGHT.update, RIGHT.delete ];
    treeList.forEach(treeItem => {
      const rights = treeItem.isRoot() ? [ RIGHT.update, RIGHT.delete ] : itemRights;
      const item = new Item({ treeItem, layout: this.getLayout(), readOnly: !rights.includes(RIGHT.update) });
      const commandItem = new CommandItemDecorator(item);
      const treeElement = new Tree(commandItem, { treeItem, layout: this.getLayout(), rights });
      super.addChild(treeElement);
    });
  }

}

export default TreeList;