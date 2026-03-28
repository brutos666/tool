'use strict';

import View from './View.js';
import { VIEW_CHOICE } from '../../tools/Constants.js';
/** @import { TaskInfos } from '../Task.js' */

class TaskView extends View {

  #what;
  #when;
  #delay;
  #state;

  #updateCallback;

  /**
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {TaskInfos} data.taskInfos - Informations sur la tache
   * @param {VIEW_CHOICE} data.viewChoice - Affichage souhaité
   */
  constructor(data) {
    super(data);
    this.majNodes();
    this.setTaskValues(data.taskInfos);
  }

  /**
   * @override {@link View.getHtmlView}
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {TaskInfos} data.taskInfos - Informations sur la tache
   * @param {VIEW_CHOICE} data.viewChoice - Affichage souhaité
   * @returns {string} - Code HTML du bouton
   */
  getHtmlView(data) {
    return data.viewChoice === VIEW_CHOICE.Detail ? getDetailView() : getPostItView();
  }

  /**
   * @override {@link View.refreshView}
   * @param {Object} data - Données à utiliser pour rafraîchir la vue
   * @param {TaskInfos} data.taskInfos - Informations sur la tache
   * @param {string} data.viewChoice - Affichage souhaité
   */
  refreshView(data) {
    this.removeEventListeners();
    super.refreshView(data);
    this.majNodes();
    this.setTaskValues(data.taskInfos);
    this.addEventListeners();
  }

  /**
   * Positionne la fonction à appeler lorsqu'une modification est effectuée sur la tache
   * @param {Function} updateCallback - Fonction appelée lorsqu'une modification est effectuée sur la tache
   */
  setUpdateCallback(updateCallback) {
    this.removeEventListeners();
    this.#updateCallback = event => {
      const property = event.target.getAttribute('id');
      const value = event.target.value;
      updateCallback(property, value);
    };
    this.addEventListeners();
  }

  majNodes() {
    const mainNode = this.getNodeView();
    this.#what = mainNode.querySelector('#what');
    this.#when = mainNode.querySelector('#when');
    this.#delay = mainNode.querySelector('#delay');
    this.#state = mainNode.querySelector('#state');
  }

  setTaskValues(taskInfos) {
    if (taskInfos.what) {
      this.#what.value = taskInfos.what;
    }
    if (taskInfos.when) {
      this.#when.value = taskInfos.when;
    }
    if (taskInfos.delay) {
      this.#delay.value = taskInfos.delay;
    }
    if (taskInfos.state) {
      this.#state.value = taskInfos.state;
    }
  }

  addEventListeners() {
    this.#what.addEventListener('input', this.#updateCallback);
    this.#when.addEventListener('input', this.#updateCallback);
    this.#delay.addEventListener('change', this.#updateCallback);
    this.#state.addEventListener('change', this.#updateCallback);
  }

  removeEventListeners() {
    if (!this.#updateCallback) {
      return;
    }
    this.#what.removeEventListener('input', this.#updateCallback);
    this.#when.removeEventListener('input', this.#updateCallback);
    this.#delay.removeEventListener('change', this.#updateCallback);
    this.#state.removeEventListener('change', this.#updateCallback);
  }

}

/**
 * Création de la vue HTML d'une tâche
 * @returns {string} - Vue HTML de la tâche
 */
function getDetailView() {
  return String.raw`
      <section class="task-card__content">
        <label for="what">What <input type="text" id="what" placeholder="Que dois-je faire"/></label>
        <label for="when">When <input type="text" id="when" placeholder="Quand dois-je le faire"/></label>
        <label for="delay">A faire dans :
          <select id="delay">
            <option value="">--Please choose an option--</option>
            <option id="delay-day" value="DAY">La journée</option>
            <option id="delay-week" value="WEEK">La semaine</option>
            <option id="delay-month" value="MONTH">Le mois</option>
            <option id="delay-year" value="YEAR">L'année</option>
          </select>
        </label>
        <label for="state" >État de la tâche
          <select id="state">
            <option value="">--Please choose an option--</option>
            <option id="state-todo" value="TODO">A faire</option>
            <option id="state-progress" value="IN_PROGRESS">En cours</option>
            <option id="state-done" value="DONE">Fait</option>
          </select>
        </label>
      </section>`;
}

/**
 * Création de la vue HTML d'une tâche
 * @returns {string} - Vue HTML de la tâche
 */
function getPostItView() {
  return String.raw`
      <section class="task-card__content task-card__content--post-it">
        <textarea class="task-card__text" type="text" id="what"></textarea>
        <div>
          <input hidden type="text" id="when"/>
          <input hidden type="text" id="delay"/>
          <input hidden type="text" id="state"/>
        </div>
      </section>`;
}

export default TaskView;