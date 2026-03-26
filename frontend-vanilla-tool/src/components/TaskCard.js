'use strict';

import { ACTION } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import Composite from './Composite.js';
import Task from './Task.js';
import TaskCardView from './views/TaskCardView.js';
/** @import { TaskInfos } from './Task.js' */

class TaskCard extends Composite {

  #submitAction;
  #deleteAction;

  /**
   * Constructeur de la classe Task
   * @param {object} data - Informations à stocker dans la tâche
   * @param {string} data.label - Label de la tâche
   * @param {TaskInfos} data.taskInfos - Informations sur la tache
   * @param {ACTION} data.action - Action de création ou de modification
   */
  constructor(data) {
    super(new TaskCardView(data.label));
    this.#submitAction = data.action;
    this.#deleteAction = data.action === ACTION.Create ? ACTION.Clear : ACTION.Delete;

    this.submitActionButton = new ActionButton({
      id: 'submitAction',
      label: ACTION.getActionLabel(this.#submitAction)
    });
    this.submitActionButton.setDisabled();

    this.deleteActionButton = new ActionButton({
      id: 'deleteAction',
      label: ACTION.getActionLabel(this.#deleteAction)
    });

    this.task = new Task(data.taskInfos);
    this.task.setUpdateCallback(updateSubmitAction.bind(this, this.submitActionButton));

    this.addChild(this.submitActionButton);
    this.addChild(this.deleteActionButton);
    this.addChild(this.task);
  }

  /**
   * Positionne la fonction à appeler pour effectuer une action sur la carte (création, modification, suppression)
   * @param {Function} doActionCallback - Fonction à appeler pour effectuer une action sur la carte
   */
  setDoActionCallback(doActionCallback) {
    this.submitActionButton.setDoActionCallback(doActionCallback.bind(null, this.#submitAction, this));
    this.deleteActionButton.setDoActionCallback(doActionCallback.bind(null, this.#deleteAction, this));
  }

  getTaskInfos() {
    return this.task.getTaskInfos();
  }

}

/**
 * Fonction appelée lorsqu'une tache est modifiée
 * Elle active le bouton de modification
 * @param {ActionButton} submitAction - action de sauvegarde
 * @param {Task} task - Tache
 */
function updateSubmitAction(submitAction, task) {
  if (task.isModified()) {
    submitAction.setEnabled();
  } else {
    submitAction.setDisabled();
  }
}

export default TaskCard;