'use strict';

import { getTodayTasks, saveTask } from '../requests/taskRequests.js';
import Button from './Button.js';
import Composite from './Composite.js';
import TaskContainer from './TaskContainer.js';
import TaskCard from './TaskCard.js';
import { ACTION } from '../tools/Constants.js';

class HomePage extends Composite {

  constructor() {
    super();

    super.createView(String.raw`<div>
      <header class="header">
        <div class="header-content"><h3>Tâches</h3></div>
      </header>
      <div id="childrenSpace"></div>
    </div>`);

    this.button = new Button({
      id: 'task-button',
      label: 'Afficher les tâches',
      onClick: this.onTaskClick.bind(this)
    });
    this.addTaskButton = new Button({
      id: 'add-task-button',
      label: 'Ajouter une tâche',
      onClick: this.onAddTaskClick.bind(this)
    });
    this.taskContainer = new TaskContainer();

    this.addChild(this.button);
    this.addChild(this.addTaskButton);
    this.addChild(this.taskContainer);
  }

  /**
   * Méthode appelée lorsque le bouton est cliqué.
   * Elle met à jour le contenu de la zone de texte avec les tâches du jour.
   */
  onTaskClick() {
    getTodayTasks(this.button)
      .then(dataTasks => {
        this.taskContainer.removeAllChildren();
        dataTasks.forEach(dataTask => {
          this.taskContainer.addChild(new TaskCard({
            label: `Tâche n°${ dataTask.id }`,
            taskInfos: dataTask,
            action: ACTION.Update,
            actionFunction: this.onActionTaskClick
          }));
        });
      });
  }

  onAddTaskClick() {
    this.taskContainer.addChild(new TaskCard({
      label: 'Nouvelle tâche',
      taskInfos: {
        goal: 'DAY',
        state: 'TODO',
      },
      action: ACTION.Create,
      actionFunction: this.onActionTaskClick
    }));
  }
  /**
   * Méthode appelée lorsque l'action d'une tâche est faite
   * @param {Element} element - Element à l'origine de la requête (bouton par exemple)
   * @param {ACTION} action - Action qui a été faite (Create, Update, Delete, Clear)
   * @param {TaskInfos} taskInfos - Informations sur la tâche
   */
  onActionTaskClick(element, action, taskInfos) {
    if (action === ACTION.Create) {
      saveTask(element, taskInfos.what, taskInfos.when);
    }
  }

}
export default HomePage;
