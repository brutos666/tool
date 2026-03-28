import CompositeView from './CompositeView.js';

class TaskContainerView extends CompositeView {

  constructor() {
    super();
  }
  /**
   * @override {@link CompositeView.getHtmlView}
   */
  getHtmlView() {
    return String.raw`<div class="tasks">
      <header class="tasks__header"><h1>Conteneur de tâches</h1></header>
      <section id="spaceChildren" class="tasks__space"></section></div>`;
  }

}

export default TaskContainerView;