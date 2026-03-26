'use strict';

import View from './View.js';
/** @import { TaskInfos } from '../Task.js' */

class TaskView extends View {

  #updateCallback;

  /**
   * Constructeur de la classe
   * @param {TaskInfos} taskInfos - Informations sur la tache
   */
  constructor(taskInfos) {
    super();

    this.displayDetailView(taskInfos);
  }

  /**
   * Positionne la fonction à appeler lorsqu'une modification est effectuée sur la tache
   * @param {Function} updateCallback - Fonction appelée lorsqu'une modification est effectuée sur la tache
   */
  setUpdateCallback(updateCallback) {
    this.#updateCallback = updateCallback;
  }

  callUpdateCallback(property, value) {
    this.#updateCallback(property, value);
  }

  displayDetailView(taskInfos) {
    this.createView(detailView(taskInfos.id));
    this.majNodes(taskInfos);
  }

  majNodes(taskInfos) {
    const mainNode = this.getNodeView();
    const what = mainNode.querySelector('#what');
    const when = mainNode.querySelector('#when');
    const delay = mainNode.querySelector('#delay');
    const state = mainNode.querySelector('#state');

    if (taskInfos.what) {
      what.value = taskInfos.what;
    }
    if (taskInfos.when) {
      when.value = taskInfos.when;
    }
    if (taskInfos.delay) {
      delay.querySelector(`input[value="${ taskInfos.delay }"]`).checked = true;
    }
    if (taskInfos.state) {
      state.querySelector(`input[value="${ taskInfos.state }"]`).checked = true;
    }
    what.addEventListener('input', event => this.callUpdateCallback('what', event.target.value));
    when.addEventListener('input', event => this.callUpdateCallback('when', event.target.value));
    delay.querySelectorAll('[id^=delay-]')
      .forEach(input => {
        input.addEventListener('change', event => this.callUpdateCallback('delay', event.target.value));
      });

    state.querySelectorAll('[id^=state-]')
      .forEach(input => {
        input.addEventListener('change', event => this.callUpdateCallback('state', event.target.value));
      });
  }

}
/**
 * Création de la vue HTML d'une tâche
 * @param {Number} id - Identifiant de la tâche
 * @returns {string} - Vue HTML de la tâche
 */
function detailView(id) {
  return String.raw`
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
          <div><input type="radio" id="state-todo-${ id }" value="TODO" name="state-${ id }"/>
          <label for="todo-${ id }">A faire</label></div>
          <div><input type="radio" id="state-progress-${ id }" value="IN_PROGRESS" name="state-${ id }"/>
          <label for="progress-${ id }">En cours</label></div>
          <div><input type="radio" id="state-done-${ id }" value="DONE" name="state-${ id }"/>
          <label for="done-${ id }">Fait</label></div>
        </fieldset>
      </section>`;
}

export default TaskView;