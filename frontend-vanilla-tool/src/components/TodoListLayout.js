import { VIEW_CHOICE } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import Component from './Component.js';
import CommandItemsDecorator from './decorators/CommandItemsDecorator.js';
import Items from './Items.js';
import TodoListLayoutView from './views/TodoListLayoutView.js';
/** @import Item from './Item.js' */

class TodoListLayout extends Component {

  name = 'TodoListLayout';

  constructor() {
    super(new TodoListLayoutView());

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
   * @returns {TodoListLayoutView}
   */
  getView() {
    return super.getView();
  }

}

export default TodoListLayout;