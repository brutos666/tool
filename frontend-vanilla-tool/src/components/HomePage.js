'use strict';

import { getTodayTasks } from '../requests/taskRequests.js';
import Button from './Button.js';
import Composite from './Composite.js';
import TaskContainer from './TaskContainer.js';

class HomePage extends Composite {

  constructor() {
    super();

    super.createView(String.raw`<div>
      <header class="header">
        <div class="header-content"><h3>Tâches</h3></div>
      </header>
      <div id="spaceChildren"></div>
    </div>`);

    this.button = new Button({ id: 'task-button', label: 'Afficher les tâches' });
    this.button.setOnclickEvent(onTaskClick.bind(this));

    this.addTaskButton = new Button({ id: 'add-task-button', label: 'Ajouter une tâche' });
    this.addTaskButton.setOnclickEvent(onAddTaskClick.bind(this));

    this.taskContainer = new TaskContainer();

    this.addChild(this.button);
    this.addChild(this.addTaskButton);
    this.addChild(this.taskContainer);
  }

}

/**
 * Méthode appelée lorsque le bouton est cliqué.
 * Elle met à jour le contenu de la zone de texte avec les tâches du jour.
 */
function onTaskClick() {
  getTodayTasks()
    .then(dataTasks => {
      this.taskContainer.removeAllChildren();
      dataTasks.forEach(dataTask => {
        this.taskContainer.displayTask(dataTask);
      }, errorMessage => {
        this.button.setError(errorMessage);
      });
    });
}
/**
 * Méthode appelée lorsque le bouton d'ajout d'une tache est cliqué.
 */
function onAddTaskClick() {
  this.taskContainer.addNewTask();
}

export default HomePage;
