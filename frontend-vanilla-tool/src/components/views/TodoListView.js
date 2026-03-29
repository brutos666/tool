import CompositeView from './CompositeView.js';

class TodoListView extends CompositeView {

  constructor(data) {
    super(data);
  }

  getHtmlView() {
    return String.raw`
      <div class="todo-list">
        <div id="spaceChildren" class="todo-list__space"></div>
      </div>`;
  }

}

export default TodoListView;