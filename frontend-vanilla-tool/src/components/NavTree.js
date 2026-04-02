import { VIEW_CHOICE } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import Component from './Component.js';
import CommandItemsDecorator from './decorators/CommandItemsDecorator.js';
import Items from './Items.js';
import Toolbar from './Toolbar.js';
import NavTreeView from './views/NavTreeView.js';
/** @import Item from './Item.js' */

class NavTree extends Component {

  name = 'NavTree';

  /** @type {Items} */
  #items;

  constructor() {
    super(new NavTreeView());

    this.#items = new Items(VIEW_CHOICE.Tree);
    const itemsWithCommands = new CommandItemsDecorator(this.#items);
    this.setStaticChild('treeItems', itemsWithCommands);

    const addNewItemAction = new ActionButton({ id: 'addNewSpace', label: '< Ajouter un espace >' });
    addNewItemAction.setDoActionCallback(this.addNewSpace.bind(this));
    const toolbar = new Toolbar();
    toolbar.addChild(addNewItemAction);
    this.setStaticChild('toolbar', toolbar);

    itemsWithCommands.loadItems();
  }

  /**
   * @override
   * @returns {NavTreeView}
   */
  getView() {
    return super.getView();
  }

  addNewSpace() {
    this.#items.addNewItem();
  }

}

export default NavTree;