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
  #updates = {};
  #onChangeCallback = null;

  /**
   * Constructeur de la classe Task
   * @param {object} data - Informations à stocker dans la tâche
   * @param {TaskInfos} data.taskInfos - Informations sur la tache
   * @param {Function} data.onChangeCallback - Fonction appelée lorsqu'une modification a lieu
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
        <label>When <input type="text" id="when" placeholder="Quand dois-je le faire"/></label>
        <fieldset id="delay">
          <legend>A faire dans :</legend>
          <div><input type="radio" id="delay-day-${ id }" value="DAY" name="delay-${ id }"/>
          <label for="delay-day-${ id }">La journée</label></div>
          <div><input type="radio" id="delay-week-${ id }" value="WEEK" name="delay-${ id }"/>
          <label for="delay-week-${ id }">La semaine</label></div>
          <div><input type="radio" id="delay-month-${ id }" value="MONTH" name="delay-${ id }"/>
          <label for="delay-month-${ id }">Le mois</label></div>
          <div><input type="radio" id="delay-year-${ id }" value="YEAR" name="delay-${ id }"/>
          <label for="delay-year-${ id }">L'année'</label></div>
        </fieldset>
        <fieldset id="state">
          <legend>État de la tâche</legend>
          <div><input type="radio" id="todo-${ id }" value="TODO" name="state-${ id }"/>
          <label for="todo-${ id }">A faire</label></div>
          <div><input type="radio" id="progress-${ id }" value="IN_PROGRESS" name="state-${ id }"/>
          <label for="progress-${ id }">En cours</label></div>
          <div><input type="radio" id="done-${ id }" value="DONE" name="state-${ id }"/>
          <label for="done-${ id }">Fait</label></div>
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
    what.addEventListener('input', setPropertyValue.bind(this, 'what'));
    when.addEventListener('input', setPropertyValue.bind(this, 'when'));
    delay
      .querySelector(`#delay-day-${ id }`)
      .addEventListener('change', setPropertyValue.bind(this, 'delay'));
    delay
      .querySelector(`#delay-week-${ id }`)
      .addEventListener('change', setPropertyValue.bind(this, 'delay'));
    delay
      .querySelector(`#delay-month-${ id }`)
      .addEventListener('change', setPropertyValue.bind(this, 'delay'));
    delay
      .querySelector(`#delay-year-${ id }`)
      .addEventListener('change', setPropertyValue.bind(this, 'delay'));
    state
      .querySelector(`#todo-${ id }`)
      .addEventListener('change', setPropertyValue.bind(this, 'state'));
    state
      .querySelector(`#progress-${ id }`)
      .addEventListener('change', setPropertyValue.bind(this, 'state'));
    state
      .querySelector(`#done-${ id }`)
      .addEventListener('change', setPropertyValue.bind(this, 'state'));
  }

  getTaskInfos() {
    // Prise en compte des modifications en cours
    return { ...this.#taskInfos, ...this.#updates };
  }

  setTaskInfos(taskInfos) {
    this.#taskInfos = taskInfos;
    this.#updates = {};
    this.#onChangeCallback(this);
  }

  setTaskInfosProperty(property, value) {
    if (this.#taskInfos[property] === value) {
      delete this.#updates[property];
    } else {
      this.#updates[property] = value;
    }
    this.#onChangeCallback(this);
  }

  isModified() {
    return Object.keys(this.#updates).length > 0;
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