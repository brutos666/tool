import CompositeView from './CompositeView.js';

class TodoListLayoutView extends CompositeView {

  constructor(data) {
    super(data);
  }

  getHtmlView() {
    return String.raw`<div class="todo-list"><header class="todo-list__header">Liste de trucs à faire</header>
      <div id="spaceChildren" class="todo-list todo-list__space"></div>
    </div>`;
  }

}

export default TodoListLayoutView;