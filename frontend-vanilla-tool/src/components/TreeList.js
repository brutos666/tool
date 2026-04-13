import Tree from './decorators/Tree.js';
import Item from './Item.js';
import { RIGHT, ITEM_LAYOUT } from '../tools/Constants.js';
import CommandItemDecorator from './decorators/CommandItemDecorator.js';
import Items from './Items.js';
import TreeListView from './views/TreeListView.js';
/** @import TreeItem from '../data/TreeItem.js'; */

class TreeList extends Items {

  name = 'TreeList';

  /**
   *
   * @param {ItemsView} view
   * @param {TreeItem} treeItem
   * @param {ITEM_LAYOUT} itemLayout
   */
  constructor(view, treeItem, itemLayout) {
    super(view === undefined ? new TreeListView() : view, treeItem, itemLayout);
  }

  setTreeItem(treeItem) {
    super.setTreeItem(treeItem);
    for (const tree of super.getItemsComponent()) {
      tree.setRoot();
      tree.setOpen(true);
    }
  }

  getLastTree() {
    const trees = super.getItemsComponent();
    return trees[trees.length - 1];
  }

  /**
   * @override
   * @param {TreeItem} treeItem - Informations sur la tache
   * @returns {Component} composant
   */
  getItemComponent(treeItem) {
    const itemRights = this.getLayout() === ITEM_LAYOUT.Title ? [] : [ RIGHT.create, RIGHT.update, RIGHT.delete ];
    const rights = treeItem.isRoot() ? [ RIGHT.update, RIGHT.delete ] : itemRights;
    const readOnly = !rights.includes(RIGHT.update);
    let item = new Item({ treeItem, layout: this.getLayout(), rights });
    if (!readOnly) {
      // Mise en place du décorateur permettant la validation en base de données
      item = new CommandItemDecorator(item, { treeItem, rights });
    }
    return new Tree(item, { treeItem, layout: this.getLayout(), rights });
  }

}

export default TreeList;