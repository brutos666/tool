import PlacedCompositeView from './PlacedCompositeView.js';

class TodoListLayoutView extends PlacedCompositeView {

  constructor(data) {
    super(data);
  }
  /**
   * @override
   * Cette classe s'occupe de disposer les 2 enfants
   * @param {View} view
   */
  addView(view) {
    if (this.getView('toolbar') === undefined) {
      super.setView('toolbar', view);
    } else {
      super.addView(view);
    }
  }

  getHtmlView() {
    return String.raw`<div class="todo-list"><header class="todo-list__header">Check List<div id="toolbar"></div></header>
      <div id="spaceChildren" class="todo-list todo-list__space"></div>
    </div>`;
  }

}

export default TodoListLayoutView;