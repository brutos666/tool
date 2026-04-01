import { VIEW_CHOICE } from '../tools/Constants.js';
import ItemsLayout from './ItemsLayout.js';
import TodoListLayoutView from './views/TodoListLayoutView.js';
/** @import Item from './Item.js' */

class TodoListLayout extends ItemsLayout {

  constructor() {
    super(VIEW_CHOICE.TodoList, new TodoListLayoutView());
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