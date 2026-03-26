'use strict';

import Component from './Component.js';
import TaskView from './views/TaskView.js';

/**
 * @typedef {Object} TaskInfos - Informations sur une tâche
 * @property {number} id - Identifiant de la tâche
 * @property {string} what - Ce qu'il faut faire
 * @property {string} when - Date à laquelle à partir de laquelle il faut faire la tâche
 * @property {TimeIndicator} delay - Indicateur de temps pour faire la tâche
 *                          - WEEK : Faire dans la semaine
 *                          - MONTH : Faire dans le mois
 *                          - YEAR : Faire dans l'année
 * @property {State} state - État de la tâche
 *                          - TODO : La tâche n'a pas encore été fait
 *                          - IN_PROGRESS : La tâche est en cours
 *                          - DONE : La tâche a been fait
 */
class Task extends Component {

  /** @type {TaskInfos} */
  #taskInfos = null;
  #updates = {};
  #updateCallback = null;

  /**
   * Constructeur de la classe Task
   * @param {TaskInfos} taskInfos - Informations sur la tache
   */
  constructor(taskInfos) {
    super(new TaskView(taskInfos));
    /** @type {TaskView} */
    const taskView = this.getView();

    taskView.setUpdateCallback(this.setPropertyValue.bind(this));
    this.#taskInfos = taskInfos;
  }

  /**
   * Positionne la fonction à appeler lorsqu'une modification est effectuée sur la tache
   * @param {Function} updateCallback - Fonction appelée lorsqu'une modification est effectuée sur la tache
   */
  setUpdateCallback(updateCallback) {
    this.#updateCallback = updateCallback;
  }

  getTaskInfos() {
    // Prise en compte des modifications en cours
    return { ...this.#taskInfos, ...this.#updates };
  }

  /**
   * Met à jour la tâche en fonction de l'événement reçu
   * @param {string} property - Propriété de la tâche à mettre à jour
   * @param {string} value - Valeur de la propriété
   *
   * @this {Task}
   */
  setPropertyValue(property, value) {
    if (this.#taskInfos[property] === value) {
      delete this.#updates[property];
    } else {
      this.#updates[property] = value;
    }
    this.#updateCallback(this);
  }

  isModified() {
    return Object.keys(this.#updates).length > 0;
  }

}

export default Task;