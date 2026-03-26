import CompositeView from './CompositeView.js';

class TaskCardView extends CompositeView {

  constructor(label) {
    super();
    this.createView(String.raw`
    <div class="task-card">
      <header class="task-card__header"><h2>${ label }</h2></header>
      <div id="spaceChildren"></div>
    </div>`);
  }

}

export default TaskCardView;