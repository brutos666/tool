'use strict';

import { getTodayTasks } from '../requests/taskRequests.js';
import ActionButton from './ActionButton.js';
import Composite from './Composite.js';
import TaskContainer from './TaskContainer.js';
import HomePageView from './views/HomePageView.js';

class HomePage extends Composite {

  constructor() {
    super(new HomePageView());

    this.displayTaskAction = new ActionButton({ id: 'display-task-action', label: 'Afficher les tâches' });
    this.displayTaskAction.setDoActionCallback(displayTasks.bind(this));

    this.addTaskAction = new ActionButton({ id: 'add-task-action', label: 'Ajouter une tâche' });
    this.addTaskAction.setDoActionCallback(addNewTask.bind(this));

    this.taskContainer = new TaskContainer();

    this.addChild(this.displayTaskAction);
    this.addChild(this.addTaskAction);
    this.addChild(this.taskContainer);
  }

}

/**
 * Méthode appelée lorsque le bouton est cliqué.
 * Elle met à jour le contenu de la zone de texte avec les tâches du jour.
 */
function displayTasks() {
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
function addNewTask() {
  this.taskContainer.addNewTask();
}

export default HomePage;
