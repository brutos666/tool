import Tree from './decorators/Tree.js';
import Item from './Item.js';
import { ITEM_LAYOUT } from '../tools/Constants.js';
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
    const layout = this.getLayout();
    const rights = ITEM_LAYOUT.getRights(layout);
    const item = new Item({ treeItem, layout, rights });
    return new Tree(item, { treeItem, layout, rights });
  }

}

export default TreeList;