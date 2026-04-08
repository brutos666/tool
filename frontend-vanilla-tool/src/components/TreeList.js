import Composite from './Composite.js';
import CommandItemDecorator from './decorators/CommandItemDecorator.js';
import Tree from './decorators/Tree.js';
import Item from './Item.js';
import TreeListView from './views/TreeListView.js';
/** @import TreeItem from '../data/TreeItem.js'; */
/** @import TreeItemList from '../data/TreeItemList.js'; */
/** @import { VIEW_CHOICE } from '../tools/Constants.js'; */

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
    treeList.forEach(treeItem => {
      const item = new Item({ treeItem, layout: this.getLayout() });
      const commandItem = new CommandItemDecorator(item);
      const treeElement = new Tree(commandItem, { treeItem, layout: this.getLayout() });
      super.addChild(treeElement);
    });
  }

}

export default TreeList;