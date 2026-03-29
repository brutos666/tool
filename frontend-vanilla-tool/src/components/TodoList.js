import { VIEW_CHOICE } from '../tools/Constants.js';
import ScreenLayout from './ScreenLayout.js';
import TodoListView from './views/TodoListView.js';

class TodoList extends ScreenLayout {

  constructor() {
    super(VIEW_CHOICE.TodoList, new TodoListView());
  }

}

export default TodoList;