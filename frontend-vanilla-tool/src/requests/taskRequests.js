'use strict';

import { callRequestApi } from './callApi.js';

/**
 * @typedef {Object} Task - Tâche
 * @property {number} id - Identifiant de la tâche
 * @property {string} what - Ce qu'il faut faire
 * @property {string} when - Date à laquelle à partir de laquelle il faut faire la tâche
 * @property {TimeIndicator} delay - Indicateur de temps pour faire la tâche
 *                          - WEEK : Faire le dans la semaine
 *                          - MONTH : Faire le dans le mois
 *                          - YEAR : Faire le dans l'année
 * @property {State} state - État de la tâche
 *                          - TODO : La tâche n'a pas encore été faite
 *                          - IN_PROGRESS : La tâche est en cours de réalisation
 *                          - DONE : La tâche a été faite
 *
 */
/**
 * Retourne la tâche du jour
 * @param {Element} element - Element à l'origine de la requête (bouton par exemple)
 * @returns {Task} - Tâche du jour
 */
async function getTodayTask(element) {
  return callRequestApi(element, 'task/today');
}

/**
 * Retourne la liste des tâches du jour
 * @param {Element} element - Element à l'origine de la requête (bouton par exemple)
 * @returns {Array<Task>} - Liste des tâches du jour
 */
async function getTodayTasks(element) {
  return callRequestApi(element, 'task/taskTodo', 'GET');
}

/**
 * Sauvegarde une tâche
 * @param {Element} element - Element à l'origine de la requête (bouton par exemple)
 * @param {string} what - Ce qu'il faut faire
 * @param {string} when - Date à laquelle à partir de laquelle il faut faire la tâche
 * @returns {Promise<Object>} - Promesse contenant les données attendues
 */
async function saveTask(element, what, when) {
  return callRequestApi(element, 'task/save', 'POST', { what, when });
}

export { getTodayTasks, getTodayTask, saveTask };
