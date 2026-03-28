'use strict';

import { getTodayTasks } from '../requests/taskRequests.js';
import { VIEW_CHOICE } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import Composite from './Composite.js';
import Select from './Select.js';
import TaskContainer from './TaskContainer.js';
import Toolbar from './Toolbar.js';

class HomePage extends Composite {

  #taskContainer;
  #tasksLoaded;

  constructor() {
    super();

    const viewSelect = new Select({ id: 'viewChoice', options: VIEW_CHOICE.getOptions() });
    viewSelect.setDoSelectCallback(this.displayTasks.bind(this));
    const addTaskAction = new ActionButton({ id: 'add-task-action', label: 'Ajouter une tâche' });
    addTaskAction.setDoActionCallback(this.addNewTask.bind(this));
    const loadTasksAction = new ActionButton({ id: 'load-tasks-action', label: 'Rafraîchir' });
    loadTasksAction.setDoActionCallback(this.loadTasks.bind(this));
    const toolbar = new Toolbar();
    toolbar.addChild(viewSelect);
    toolbar.addChild(addTaskAction);
    toolbar.addChild(loadTasksAction);

    /** @type {TaskContainer} */
    this.#taskContainer = new TaskContainer({ viewChoice: VIEW_CHOICE.TodoList });
    this.addChild(toolbar);
    this.addChild(this.#taskContainer);
  }
  /**
   * Méthode appelée lorsque le bouton est cliqué.
   * Elle met à jour le contenu de la zone de texte avec les tâches du jour.
   * @param {VIEW_CHOICE} viewChoice - Affichage souhaité
   * @this {HomePage}
   */
  displayTasks(viewChoice) {
    this.#taskContainer.changeView(viewChoice);
    if (!this.#tasksLoaded) {
      this.loadTasks();
    }
  }
  /**
   * Méthode appelée lorsque le bouton d'ajout d'une tache est cliqué.
   * @this {HomePage}
   */
  addNewTask() {
    this.#taskContainer.addNewTask();
  }

  loadTasks() {
    getTodayTasks()
      .then(dataTasks => {
        this.#taskContainer.removeAllChildren();
        dataTasks.forEach(dataTask => {
          this.#taskContainer.displayTask(dataTask);
        });
      });
    this.#tasksLoaded = true;
  }

}

export default HomePage;
