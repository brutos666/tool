'use strict';

import { ACTION } from '../tools/Constants.js';
import Button from './Button.js';
import Composite from './Composite.js';
import Task from './Task.js';
/** @import { TaskInfos } from './Task.js' */

class TaskCard extends Composite {

  /**
   * @callback ActionFunction - Fonction à appeler lorsqu'une action (création, suppression, ...) est effectuée
   * @param {Element} element - Element à l'origine de l'action
   * @param {ACTION} action - Action effectuée
   * @param {TaskInfos} taskInfos - Informations sur la tâche
   */

  /**
   * Constructeur de la classe Task
   * @param {object} data - Informations à stocker dans la tâche
   * @param {string} data.label - Label de la tâche
   * @param {TaskInfos} data.taskInfos - Informations sur la tache
   * @param {ACTION} data.action - Action de création, modification ou suppression
   * @param {ActionFunction} data.actionFunction - Fonction à appeler lorsqu'une action est effectuée
   */
  constructor(data) {
    super(data);
    this.createView(String.raw`
    <div class="task-card">
      <header class="task-card__header"><h2>${ data.label }</h2></header>
      <div id="childrenSpace"></div>
      <footer class="task-card__footer"><button class="task-card__action">Valider</button></footer>
    </div>`);
    /** @type {TaskInfos} */
    this.taskInfos = data.taskInfos;

    this.task = new Task({ taskInfos: data.taskInfos });
    this.actionButton = new Button({ label: 'Valider', id: 'submitButton', onClick: onClickActionButton.bind(this, data.taskInfos.id, data.action, data.actionFunction) });

    this.addChild(this.actionButton);
    this.addChild(this.task);
  }

  getWhen() {
    return this.when.value;
  }

  getWhat() {
    return this.what.value;
  }

  getGoal() {
    return this.goal.querySelector('input:checked').value;
  }

  getState() {
    return this.state.querySelector('input:checked').value;
  }

  /**
   * Positionne l'action du button
   * @param {ACTION} action - Action de création, modification ou suppression
   * @param {Function} callback - Fonction à appeler lorsque le button est cliqué
   */
  setAction(action, callback) {
    this.button.innerHTML = ACTION.getActionLabel(action);
    this.button.classList.remove('.hidden');
    this.button.addEventListener('click', callback.bind(this));
  }

  removeAction() {
    this.button.innerHTML = '';
    this.button.classList.add('.hidden');
    this.button.removeAllEventListeners();
  }

}

/**
 * Fonction appelée lorsque le button de la tâche est cliqué.
 * Elle appelle la fonction actionFunction avec les informations de la tâche.
 * @param {number} id - Identifiant de la tâche
 * @param {ACTION} action - Action de création, modification ou suppression
 * @param {ActionFunction} actionFunction - Fonction à appeler lorsque le button est cliqué
 */
function onClickActionButton(id, action, actionFunction) {
  const taskInfos = {
    id,
    what: this.getWhat(),
    when: this.getWhen(),
    goal: this.getGoal(),
    state: this.getState()
  };

  actionFunction.call(null, this.button, action, taskInfos);
}

export default TaskCard;