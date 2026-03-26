'use strict';

import Composite from './Composite.js';
import TaskCard from './TaskCard.js';
import { ACTION } from '../tools/Constants.js';
import DeleteTask from '../commands/DeleteTask.js';
import SaveNewTask from '../commands/SaveNewTask.js';
import ModifyTask from '../commands/ModifyTask.js';

class TaskContainer extends Composite {

  constructor() {
    super();
    this.createView(String.raw`<div class="tasks">
      <header class="tasks__header"><h1>Conteneur de tâches</h1></header>
      <section id="spaceChildren" class="tasks__space"></section></div>`);
  }

  addNewTask() {
    this.addChild(new TaskCard({
      label: 'Nouvelle tâche',
      taskInfos: {
        delay: 'DAY',
        state: 'TODO',
      },
      action: ACTION.Create,
      actionCallback: onActionOnTask.bind(this)
    }));
  }

  displayTask(taskInfos) {
    this.addChild(getBasedTask(taskInfos, onActionOnTask.bind(this)));
  }

  replaceTask(taskCard, taskInfos) {
    super.replaceChild(taskCard, getBasedTask(taskInfos, onActionOnTask.bind(this)));
  }

}
/**
 * Méthode appelée lorsqu'une action est effectuée sur une tâche.
 * @param {ACTION} action - action effectuée
 * @param {TaskCard} taskCard - tâche concernée
 *
 * @this {TaskContainer}
 */
function onActionOnTask(action, taskCard) {
  switch (action) {
    case ACTION.Create:
      new SaveNewTask(this, taskCard, taskCard.getTaskInfos())
        .execute();
      break;
    case ACTION.Update:
      new ModifyTask(taskCard, taskCard.getTaskInfos())
        .execute();
      break;
    case ACTION.Delete:
      new DeleteTask(this, taskCard.getTaskInfos())
        .execute();
      this.removeChild(taskCard);
      break;
    case ACTION.Clear:
      this.removeChild(taskCard);
      break;

    default:
      break;
  }
}

/**
 * Créer une nouvelle tâche basée avec les informations fournies
 * @param {TaskInfos} taskInfos - Informations sur la tâche
 * @param {Function} actionCallback - Fonction appelée lorsqu'une action est effectuée sur la tâche
 * @return {TaskCard} nouvelle tâche
 */
function getBasedTask(taskInfos, actionCallback) {
  return new TaskCard({
    label: `Tâche n°${ taskInfos.id }`,
    taskInfos,
    action: ACTION.Update,
    actionCallback
  });
}

export default TaskContainer;