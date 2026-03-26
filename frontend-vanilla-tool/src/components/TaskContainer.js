'use strict';

import Composite from './Composite.js';
import TaskCard from './TaskCard.js';
import { ACTION } from '../tools/Constants.js';
import DeleteTask from '../commands/DeleteTask.js';
import CreateTask from '../commands/CreateTask.js';
import ModifyTask from '../commands/ModifyTask.js';
import ClearTask from '../commands/ClearTask.js';
import TaskContainerView from './views/TaskContainerView.js';

class TaskContainer extends Composite {

  constructor() {
    super(new TaskContainerView());
  }

  addNewTask() {
    const newTaskCard = new TaskCard({
      label: 'Nouvelle tâche',
      taskInfos: { delay: 'DAY', state: 'TODO' },
      action: ACTION.Create
    });

    newTaskCard.setDoActionCallback(doAction.bind(this));

    this.addChild(newTaskCard);
  }

  displayTask(taskInfos) {
    super.addChild(getBasedTask(taskInfos, doAction.bind(this)));
  }

  replaceTask(taskCard, taskInfos) {
    super.replaceChild(taskCard, getBasedTask(taskInfos, doAction.bind(this)));
  }

}
/**
 * Exécute l'action de créer, modifier, effacer ou supprimer une tâche
 * @param {ACTION} action - action effectuée
 * @param {TaskCard} taskCard - tâche concernée
 *
 * @this {TaskContainer}
 */
function doAction(action, taskCard) {
  switch (action) {
    case ACTION.Create:
      new CreateTask(this, taskCard)
        .execute();
      break;
    case ACTION.Update:
      new ModifyTask(this, taskCard)
        .execute();
      break;
    case ACTION.Delete:
      new DeleteTask(this, taskCard)
        .execute();
      break;
    case ACTION.Clear:
      new ClearTask(this, taskCard)
        .execute();
      break;

    default:
      break;
  }
}

/**
 * Créer une nouvelle tâche basée avec les informations fournies
 * @param {TaskInfos} taskInfos - Informations sur la tâche
 * @param {Function} doActionCallback - Fonction à appeler pour effectuer une action sur la carte
 * @return {TaskCard} nouvelle tâche
 */
function getBasedTask(taskInfos, doActionCallback) {
  const taskCard = new TaskCard({
    label: `Tâche n°${ taskInfos.id }`,
    taskInfos,
    action: ACTION.Update
  });

  taskCard.setDoActionCallback(doActionCallback);

  return taskCard;
}

export default TaskContainer;