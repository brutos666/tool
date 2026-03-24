'use strict';

import { ACTION } from '../tools/Constants.js';
import { saveTask } from '../requests/taskRequests.js';
import Button from './Button.js';
import Composite from './Composite.js';
import Task from './Task.js';
/** @import { TaskInfos } from './Task.js' */
/** @import NodeElement from './NodeElement.js' */

class TaskCard extends Composite {

  /**
   * Constructeur de la classe Task
   * @param {object} data - Informations à stocker dans la tâche
   * @param {string} data.label - Label de la tâche
   * @param {TaskInfos} data.taskInfos - Informations sur la tache
   * @param {ACTION} data.action - Action de création, modification ou suppression
   * @param {Function} data.callback - Fonction appelée lorsqu'une action est effectuée sur la tache
   */
  constructor(data) {
    super(data);

    this.createView(String.raw`
    <div class="task-card">
      <header class="task-card__header"><h2>${ data.label }</h2></header>
      <div id="childrenSpace"></div>
    </div>`);

    const deleteAction = data.action === ACTION.Create ? ACTION.Clear : ACTION.Delete;

    this.actionButton = new Button({
      label: ACTION.getActionLabel(data.action),
      id: 'submitButton',
      onClick: onClickAction.bind(this, 'submitButton', data.action, data.callback)
    });
    this.deleteButton = new Button({
      label: ACTION.getActionLabel(deleteAction),
      id: 'deleteButton',
      onClick: onClickAction.bind(this, 'deleteButton', deleteAction, data.callback)
    });
    this.task = new Task({ taskInfos: data.taskInfos });

    this.addChild(this.actionButton);
    this.addChild(this.deleteButton);
    this.addChild(this.task);
  }

  getTaskInfos() {
    return this.task.getTaskInfos();
  }

}

/**
 * Fonction appelée lorsqu'une action est effectuée sur la tache
 * Elle appelle la fonction actionFunction avec les informations de la tâche.
 * @param {string} idElement - Identifiant de l'élément qui a déclenché l'action
 * @param {ACTION} action - Action de création, modification ou suppression
 * @param {Function} callback - Fonction appelée lorsque le button de la tâche est cliqué
 *
 * @this {TaskCard}
 */
function onClickAction(idElement, action, callback) {
  const taskInfos = this.task.getTaskInfos();
  /** @type {NodeElement} */
  const element = this.getChildById(idElement);

  if (action === ACTION.Create) {
    saveTask(element, taskInfos.what, taskInfos.when);
  }
  callback(this, element, action);
}

export default TaskCard;