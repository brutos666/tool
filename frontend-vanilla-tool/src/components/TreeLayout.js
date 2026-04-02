import { VIEW_CHOICE } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import Component from './Component.js';
import CommandItemsDecorator from './decorators/CommandItemsDecorator.js';
import Items from './Items.js';
import TreeLayoutView from './views/TreeLayoutView.js';
/** @import Item from './Item.js' */

class TreeLayout extends Component {

  name = 'TreeLayout';

  constructor() {
    super(new TreeLayoutView());

    const items = new Items(VIEW_CHOICE.Tree);
    const itemsWithCommands = new CommandItemsDecorator(items);
    this.setStaticChild('treeItems', itemsWithCommands);

    const addNewItemAction = new ActionButton({ id: 'addNewSpace', label: '< Ajouter un espace >' });
    addNewItemAction.setDoActionCallback(items.addNewItem.bind(this));
    this.setStaticChild('addNewSpace', addNewItemAction);

    itemsWithCommands.loadItems();
  }

  /**
   * @override
   * @returns {TreeLayoutView}
   */
  getView() {
    return super.getView();
  }

}

export default TreeLayout;