'use strict';

import Composite from './Composite.js';
import TaskCard from './TaskCard.js';
import { ACTION } from '../tools/Constants.js';
import DeleteTask from '../commands/DeleteTask.js';
import CreateTask from '../commands/CreateTask.js';
import ModifyTask from '../commands/ModifyTask.js';
import ClearTask from '../commands/ClearTask.js';
import TaskContainerView from './views/TaskContainerView.js';
/** @import { TaskInfos } from './Task.js' */

class TaskContainer extends Composite {

  #viewChoice;
  /**
   * @constructor
   * @param {object} data - Informations à stocker dans la tâche
   * @param {VIEW_CHOICE} data.viewChoice - Affichage souhaité
   */
  constructor(data) {
    super(new TaskContainerView());
    this.#viewChoice = data.viewChoice;
  }
  changeView(viewChoice) {
    this.#viewChoice = viewChoice;
    this.getChildren()
      .forEach(taskCard => {
        taskCard.updateTaskView(viewChoice);
      });
  }

  addNewTask() {
    const newTaskCard = new TaskCard({
      label: 'Nouvelle tâche',
      taskInfos: { },
      viewChoice: this.#viewChoice
    });

    newTaskCard.setDoActionCallback(doAction.bind(this));

    this.addChild(newTaskCard);
  }

  displayTask(taskInfos) {
    const taskCard = new TaskCard({
      label: `Tâche n°${ taskInfos.id }`,
      taskInfos,
      viewChoice: this.#viewChoice
    });

    taskCard.setDoActionCallback(doAction.bind(this));
    super.addChild(taskCard);
  }

  /**
   *
   * @param {TaskCard} taskCard -
   * @param {TaskInfos} taskInfos
   */
  updateData(taskCard, taskInfos) {
    taskCard.updateTaskInfos(taskInfos);
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
    case ACTION.Save:
      if (taskCard.isNew()) {
        new CreateTask(this, taskCard)
          .execute();
      } else {
        new ModifyTask(this, taskCard)
          .execute();
      }
      break;
    case ACTION.Delete:
      if (taskCard.isNew()) {
        new ClearTask(this, taskCard)
          .execute();
      } else {
        new DeleteTask(this, taskCard)
          .execute();
      }
      break;

    default:
      break;
  }
}

export default TaskContainer;