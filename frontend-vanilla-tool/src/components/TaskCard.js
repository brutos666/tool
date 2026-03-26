'use strict';

import { ACTION } from '../tools/Constants.js';
import Button from './Button.js';
import Composite from './Composite.js';
import Task from './Task.js';
/** @import { TaskInfos } from './Task.js' */

class TaskCard extends Composite {

  #executeActionCallback;
  #action;

  /**
   * Constructeur de la classe Task
   * @param {object} data - Informations à stocker dans la tâche
   * @param {string} data.label - Label de la tâche
   * @param {TaskInfos} data.taskInfos - Informations sur la tache
   * @param {ACTION} data.action - Action de création ou de modification
   * @param {Function} data.actionCallback - Fonction appelée lorsqu'une action est effectuée sur la tache
   */
  constructor(data) {
    super();
    this.#executeActionCallback = data.actionCallback;

    this.createView(String.raw`
    <div class="task-card">
      <header class="task-card__header"><h2>${ data.label }</h2></header>
      <div id="spaceChildren"></div>
    </div>`);

    this.submitButton = new Button({ id: 'submitButton', label: '' });
    this.deleteButton = new Button({ id: 'deleteButton', label: '' });

    this.task = new Task({
      taskInfos: data.taskInfos,
      onChangeCallback: onTaskChange.bind(this, this.submitButton)
    });

    this.addChild(this.submitButton);
    this.addChild(this.deleteButton);
    this.addChild(this.task);

    this.setAction(data.action);
    this.submitButton.setDisabled();
  }

  getTaskInfos() {
    return this.task.getTaskInfos();
  }

  setAction(action) {
    this.#action = action;
    changeActionButton(this, this.submitButton, action, this.#executeActionCallback);
    changeActionButton(this, this.deleteButton, action === ACTION.Create ? ACTION.Clear : ACTION.Delete, this.#executeActionCallback);
  }

  getAction() {
    return this.#action;
  }

  setBased() {
    this.setAction(ACTION.Update);
  }

}

/**
 * Fonction appelée lorsqu'une tache est modifiée
 * Elle active le bouton de modification
 * @param {Button} submitButton - Bouton de modification
 * @param {Task} task - Tache
 */
function onTaskChange(submitButton, task) {
  if (task.isModified()) {
    submitButton.setEnabled();
  } else {
    submitButton.setDisabled();
  }
}

/**
 * Change l'action d'un bouton
 * @param {TaskCard} taskCard - Tache
 * @param {Button} button - Bouton
 * @param {string} action - Nouvelle action
 * @param {Function} executeActionCallback - Fonction à exécuter sur le click du bouton
 */
function changeActionButton(taskCard, button, action, executeActionCallback) {
  button.changeLabel(ACTION.getActionLabel(action));
  button.setOnclickEvent(executeActionCallback.bind(null, action, taskCard));
}

export default TaskCard;