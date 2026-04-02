import { VIEW_CHOICE } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import Component from './Component.js';
import CommandItemsDecorator from './decorators/CommandItemsDecorator.js';
import Items from './Items.js';
import CheckListView from './views/CheckListView.js';
/** @import Item from './Item.js' */

class CheckList extends Component {

  name = 'CheckList';

  constructor() {
    super(new CheckListView());

    const items = new Items(VIEW_CHOICE.TodoList);
    const itemsWithCommands = new CommandItemsDecorator(items);
    this.setStaticChild('todoItems', itemsWithCommands);

    const loadItemsAction = new ActionButton({ id: 'loadItems', label: 'Rafraîchir' });
    loadItemsAction.setDoActionCallback(itemsWithCommands.loadItems.bind(itemsWithCommands));
    this.setStaticChild('loadItems', loadItemsAction);

    itemsWithCommands.loadItems();
  }
  /**
   * @override
   * @returns {CheckListView}
   */
  getView() {
    return super.getView();
  }

}

export default CheckList;