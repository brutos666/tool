'use strict';

import Composite from './Composite.js';
import TaskCard from './TaskCard.js';
import { ACTION } from '../tools/Constants.js';

class TaskContainer extends Composite {

  constructor() {
    super({ id: 'taskContainer' });
    this.createView(String.raw`<div id="taskContainer" class="tasks">
      <header class="tasks__header"><h1>Conteneur de tâches</h1></header>
      <section id="childrenSpace" class="tasks__space"></section></div>`);
  }

  addNewTask() {
    this.addChild(new TaskCard({
      label: 'Nouvelle tâche',
      taskInfos: {
        delay: 'DAY',
        state: 'TODO',
      },
      action: ACTION.Create,
      callback: onActionOnTask.bind(this)
    }));
  }

  displayTask(taskInfos) {
    this.addChild(new TaskCard({
      label: `Tâche n°${ taskInfos.id }`,
      taskInfos,
      action: ACTION.Update,
      callback: onActionOnTask.bind(this)
    }));
  }

}
/**
 * Méthode appelée lorsqu'une action est effectuée sur une tâche.
 * @param {TaskCard} taskCard - La tâche qui a été supprimée
 * @param {NodeElement} element - Element à l'origine de l'action
 * @param {ACTION} action - L'action de suppression (Delete ou Clear)
 *
 * @this {TaskContainer}
 */
function onActionOnTask(taskCard, element, action) {
  if (action === ACTION.Delete || action === ACTION.Clear) {
    this.removeChild(taskCard);
  }
}

export default TaskContainer;