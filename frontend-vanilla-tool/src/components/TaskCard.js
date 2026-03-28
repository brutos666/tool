'use strict';

import { ACTION } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import Composite from './Composite.js';
import Task from './Task.js';
import Toolbar from './Toolbar.js';
import TaskCardView from './views/TaskCardView.js';
/** @import { TaskInfos } from './Task.js' */

class TaskCard extends Composite {

  #submitActionButton;
  #deleteActionButton;
  #task;

  /**
   * @constructor de la classe Task
   * @param {object} data - Informations à stocker dans la tâche
   * @param {string} data.label - Label de la tâche
   * @param {TaskInfos} data.taskInfos - Informations sur la tache
   * @param {VIEW_CHOICE} data.viewChoice - Affichage souhaité
   */
  constructor(data) {
    super(new TaskCardView({ id: data.taskInfos.id }));

    this.#submitActionButton = new ActionButton({
      id: 'submitAction',
      label: ACTION.getActionLabel(ACTION.Save)
    });
    this.#submitActionButton.setDisabled();

    this.#deleteActionButton = new ActionButton({
      id: 'deleteAction',
      label: ACTION.getActionLabel(ACTION.Delete)
    });

    this.#task = new Task({ taskInfos: data.taskInfos, viewChoice: data.viewChoice });
    this.#task.setUpdateCallback(updateSubmitAction.bind(this, this.#submitActionButton));

    const toolbar = new Toolbar();
    toolbar.addChild(this.#submitActionButton);
    toolbar.addChild(this.#deleteActionButton);

    this.addChild(toolbar);
    this.addChild(this.#task);
  }

  updateTaskView(viewChoice) {
    this.#task.updateData({ viewChoice });
  }

  /**
   * Mise à jour des informations de la tache
   * @param {TaskInfos} taskInfos - Informations sur la tache
   */
  updateTaskInfos(taskInfos) {
    this.updateData({ id: taskInfos.id });
    this.#task.updateData({ taskInfos });
    this.#submitActionButton.setDisabled();
  }

  /**
   * Positionne la fonction à appeler pour effectuer une action sur la carte (création, modification, suppression)
   * @param {Function} doActionCallback - Fonction à appeler pour effectuer une action sur la carte
   */
  setDoActionCallback(doActionCallback) {
    this.#submitActionButton.setDoActionCallback(doActionCallback.bind(null, ACTION.Save, this));
    this.#deleteActionButton.setDoActionCallback(doActionCallback.bind(null, ACTION.Delete, this));
  }

  getTaskInfos() {
    return this.#task.getTaskInfos();
  }

  isNew() {
    return this.#task.isNew();
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