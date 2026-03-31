import { VIEW_CHOICE } from '../tools/Constants.js';
import ScreenLayout from './ScreenLayout.js';
import TreeLayoutView from './views/TreeLayoutView.js';
/** @import Item from './Item.js' */

class TreeLayout extends ScreenLayout {

  constructor() {
    super(VIEW_CHOICE.Tree, new TreeLayoutView());
  }
  /**
   * @override
   * @param {Item} item - item
   */
  addItem(item) {
    super.addItem(item);
  }

}

export default TreeLayout;