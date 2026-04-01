import { VIEW_CHOICE } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import ItemsLayout from './ItemsLayout.js';
import TreeLayoutView from './views/TreeLayoutView.js';
/** @import Item from './Item.js' */

class TreeLayout extends ItemsLayout {

  constructor() {
    super(VIEW_CHOICE.Tree, new TreeLayoutView());

    const addNewItemAction = new ActionButton({ id: 'add-new-item-action', label: '< Ajouter un espace >' });
    addNewItemAction.setDoActionCallback(this.addNewItem.bind(this));
    this.addChild(addNewItemAction);
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