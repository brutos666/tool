'use strict';

import Component from './Component.js';

/**
 * @typedef {Object} TaskInfos - Informations sur une tâche
 * @property {number} id - Identifiant de la tâche
 * @property {string} what - Ce qu'il faut faire
 * @property {string} when - Date à laquelle à partir de laquelle il faut faire la tâche
 * @property {TimeIndicator} goal - Indicateur de temps pour faire la tâche
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
    this.createView(String.raw`
      <section class="task-card__content" id="${ data.taskInfos.id }">
        <label>What <input type="text" id="what" placeholder="Que dois-je faire"/></label>
        <label>When <input type="text" id="when" placeholder="Quand dois-je le faire" /></label>
        <fieldset id="goal">
          <legend>A faire dans :</legend>
          <div><input type="radio" id="goal-day" value="DAY" /><label for="goal-day">La journée</label></div>
          <div><input type="radio" id="goal-week" value="WEEK" /><label for="goal-week">La semaine</label></div>
          <div><input type="radio" id="goal-month" value="MONTH" /><label for="goal-month">Le mois</label></div>
          <div><input type="radio" id="goal-year" value="YEAR" /><label for="goal-year">L'année'</label></div>
        </fieldset>
        <fieldset id="state">
          <legend>État de la tâche</legend>
          <div><input type="radio" id="todo" value="TODO" /><label for="todo">A faire</label></div>
          <div><input type="radio" id="progress" value="IN_PROGRESS" /><label for="progress">En cours</label></div>
          <div><input type="radio" id="done" value="DONE" /><label for="done">Fait</label></div>
        </fieldset>
      </section>`);

    /** @type {TaskInfos} */
    this.taskInfos = data.taskInfos;
    this.what = this.getNodeView()
      .querySelector('#what');
    this.when = this.getNodeView()
      .querySelector('#when');
    this.goal = this.getNodeView()
      .querySelector('#goal');
    this.state = this.getNodeView()
      .querySelector('#state');

    if (data.taskInfos.what) {
      this.what.value = data.taskInfos.what;
    }
    if (data.taskInfos.when) {
      this.when.value = data.taskInfos.when;
    }
    if (data.taskInfos.goal) {
      this.goal.querySelector(`input[value="${ data.taskInfos.goal }"]`).checked = true;
    }
    if (data.taskInfos.state) {
      this.state.querySelector(`input[value="${ data.taskInfos.state }"]`).checked = true;
    }
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

  getTaskInfos() {
    return {
      id: this.getNodeView()
        .getAttribute('id'),
      what: this.getWhat(),
      when: this.getWhen(),
      goal: this.getGoal(),
      state: this.getState()
    };
  }

}
export default Task;