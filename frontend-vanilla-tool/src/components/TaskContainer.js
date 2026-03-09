'use strict';

import Composite from './Composite.js';

class TaskContainer extends Composite {

  constructor() {
    super({ id: 'taskContainer' });
    this.createView(String.raw`<div id="taskContainer" class="tasks">
      <header class="tasks__header"><h1>Conteneur de tâches</h1></header>
      <section id="childrenSpace" class="tasks__space"></section></div>`);
  }

}

export default TaskContainer;