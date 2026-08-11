import TreeItems from './TreeItems.js';
import TreeListView from './views/TreeListView.js';
/** @import TreeItem from '../data/TreeItem.js'; */

class TreeList extends TreeItems {

  name = 'TreeList';

  /**
   *
   * @param {TreeItem} treeItem
   * @param {ITEM_LAYOUT} itemLayout
   */
  constructor(treeItem, itemLayout) {
    super(new TreeListView(), treeItem, itemLayout);
  }

}

export default TreeList;