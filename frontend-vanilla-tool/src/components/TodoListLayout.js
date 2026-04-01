import { VIEW_CHOICE } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import ItemsLayout from './ItemsLayout.js';
import TodoListLayoutView from './views/TodoListLayoutView.js';
/** @import Item from './Item.js' */

class TodoListLayout extends ItemsLayout {

  constructor() {
    super(VIEW_CHOICE.TodoList, new TodoListLayoutView());

    const loadItemsAction = new ActionButton({ id: 'loadItems', label: 'Rafraîchir' });
    loadItemsAction.setDoActionCallback(this.loadItems.bind(this));
    this.setStaticChild('loadItems', loadItemsAction);
  }
  /**
   * @override
   * @returns {TodoListLayoutView}
   */
  getView() {
    return super.getView();
  }

  /**
   * @override
   * @param {Item} item - item
   */
  addItem(item) {
    super.addItem(item);
  }

}

export default TodoListLayout;