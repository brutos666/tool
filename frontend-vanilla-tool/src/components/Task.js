'use strict';

import Component from './Component.js';

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
  #onChangeCallback = null;

  /**
   * Constructeur de la classe Task
   * @param {object} data - Informations à stocker dans la tâche
   * @param {TaskInfos} data.taskInfos - Informations sur la tache
   * @param {Function} data.onChangeCallback - Fonction appelée lorsqu'une action est effectuée sur la tache
   */
  constructor(data) {
    super();

    let what, when, delay, state;
    const id = data.taskInfos.id;

    this.#taskInfos = data.taskInfos;
    this.#onChangeCallback = data.onChangeCallback;

    this.createView(String.raw`
      <section class="task-card__content">
        <label>What <input type="text" id="what" placeholder="Que dois-je faire"/></label>
        <label>When <input type="text" id="when" placeholder="Quand dois-je le faire" /></label>
        <fieldset id="delay">
          <legend>A faire dans :</legend>
          <div><input type="radio" id="delay-day" value="DAY" name="delay-${ id }" /><label for="delay-day">La journée</label></div>
          <div><input type="radio" id="delay-week" value="WEEK" name="delay-${ id }"/><label for="delay-week">La semaine</label></div>
          <div><input type="radio" id="delay-month" value="MONTH" name="delay-${ id }" /><label for="delay-month">Le mois</label></div>
          <div><input type="radio" id="delay-year" value="YEAR" name="delay-${ id }" /><label for="delay-year">L'année'</label></div>
        </fieldset>
        <fieldset id="state">
          <legend>État de la tâche</legend>
          <div><input type="radio" id="todo" value="TODO" name="state-${ id }" /><label for="todo">A faire</label></div>
          <div><input type="radio" id="progress" value="IN_PROGRESS" name="state-${ id }" /><label for="progress">En cours</label></div>
          <div><input type="radio" id="done" value="DONE" name="state-${ id }" /><label for="done">Fait</label></div>
        </fieldset>
      </section>`);

    what = this.getNodeView()
      .querySelector('#what');
    when = this.getNodeView()
      .querySelector('#when');
    delay = this.getNodeView()
      .querySelector('#delay');
    state = this.getNodeView()
      .querySelector('#state');

    if (this.#taskInfos.what) {
      what.value = this.#taskInfos.what;
    }
    if (this.#taskInfos.when) {
      when.value = this.#taskInfos.when;
    }
    if (this.#taskInfos.delay) {
      delay.querySelector(`input[value="${ this.#taskInfos.delay }"]`).checked = true;
    }
    if (this.#taskInfos.state) {
      state.querySelector(`input[value="${ this.#taskInfos.state }"]`).checked = true;
    }

    // Écoute des changements pour mettre à jour le modèle
    what.addEventListener('change', setPropertyValue.bind(this, 'what'));
    when.addEventListener('change', setPropertyValue.bind(this, 'when'));
    delay
      .querySelector('#delay-day')
      .addEventListener('change', setPropertyValue.bind(this, 'delay'));
    delay
      .querySelector('#delay-week')
      .addEventListener('change', setPropertyValue.bind(this, 'delay'));
    delay
      .querySelector('#delay-month')
      .addEventListener('change', setPropertyValue.bind(this, 'delay'));
    delay
      .querySelector('#delay-year')
      .addEventListener('change', setPropertyValue.bind(this, 'delay'));
    state
      .querySelector('#todo')
      .addEventListener('change', setPropertyValue.bind(this, 'state'));
    state
      .querySelector('#progress')
      .addEventListener('change', setPropertyValue.bind(this, 'state'));
    state
      .querySelector('#done')
      .addEventListener('change', setPropertyValue.bind(this, 'state'));
  }

  getTaskInfos() {
    return this.#taskInfos;
  }
  setTaskInfosProperty(property, value) {
    this.#taskInfos[property] = value;
    this.#onChangeCallback();
  }

}
/**
 * Met à jour la tâche en fonction de l'événement reçu
 * @param {Event} changeEvent - Événement reçu
 * @param {string} property - Propriété de la tâche à mettre à jour
 *
 * @this {Task}
 */
function setPropertyValue(property, changeEvent) {
  this.setTaskInfosProperty(property, changeEvent.target.value);
}
export default Task;