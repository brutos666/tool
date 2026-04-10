import Composite from './Composite.js';
import Tree from './decorators/Tree.js';
import Item from './Item.js';
import TreeListView from './views/TreeListView.js';
import { RIGHT, VIEW_CHOICE } from '../tools/Constants.js';
import CommandItemDecorator from './decorators/CommandItemDecorator.js';
/** @import TreeItem from '../data/TreeItem.js'; */
/** @import TreeItemList from '../data/TreeItemList.js'; */

class TreeList extends Composite {

  name = 'TreeList';

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
   * @param {'remove'|'add'|'replaceAll'} action
   * @param {Array<TreeItem>} treeList
   */
  update(action, treeList) {
    if (action === 'replaceAll') {
      this.replaceAllItems(treeList);
    } else if (action === 'add') {
      this.addItems(treeList);
    } else if (action === 'remove') {
      this.removeItems(treeList);
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
      const readOnly = !rights.includes(RIGHT.update);
      const item = new Item({ treeItem, layout: this.getLayout(), rights });
      if (readOnly) {
        super.addChild(new Tree(item, { treeItem, layout: this.getLayout(), rights }));
        return;
      }
      // Mise en place du décorateur permettant la validation en base de données
      const commandItem = new CommandItemDecorator(item, { treeItem, rights });
      const treeElement = new Tree(commandItem, { treeItem, layout: this.getLayout(), rights });
      super.addChild(treeElement);
    });
  }
  removeItems(treeList) {
    treeList.forEach(treeItem => {
      const child = this.getChildren()
        .find(child => child.getTreeItem() === treeItem);
      // Trouver l'enfant qui correspond à l'item
      this.removeChild(child);
    });
  }

}

export default TreeList;