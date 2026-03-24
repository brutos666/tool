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

  /**
   * Constructeur de la classe Task
   * @param {object} data - Informations à stocker dans la tâche
   * @param {TaskInfos} data.taskInfos - Informations sur la tache
   */
  constructor(data) {
    super(data);
    const taskInfos = data.taskInfos;
    const id = taskInfos.id;

    this.createView(String.raw`
      <section class="task-card__content" id="${ id }">
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
          <div><input type="radio" id="done" value="DONE" name/><label for="done">Fait</label></div>
        </fieldset>
      </section>`);

    this.what = this.getNodeView()
      .querySelector('#what');
    this.when = this.getNodeView()
      .querySelector('#when');
    this.delay = this.getNodeView()
      .querySelector('#delay');
    this.state = this.getNodeView()
      .querySelector('#state');

    if (taskInfos.what) {
      this.what.value = taskInfos.what;
    }
    if (taskInfos.when) {
      this.when.value = taskInfos.when;
    }
    if (taskInfos.delay) {
      this.delay.querySelector(`input[value="${ taskInfos.delay }"]`).checked = true;
    }
    if (taskInfos.state) {
      this.state.querySelector(`input[value="${ taskInfos.state }"]`).checked = true;
    }
  }

  getWhen() {
    return this.when.value;
  }

  getWhat() {
    return this.what.value;
  }

  getDelay() {
    return this.delay.querySelector('input:checked').value;
  }

  getState() {
    return this.state.querySelector('input:checked').value;
  }

  getTaskInfos() {
    return {
      id: this.getNodeView()
        .getAttribute('id'),
      what: this.getWhat(),
      when: this.getWhen(),
      delay: this.getDelay(),
      state: this.getState()
    };
  }

}
export default Task;