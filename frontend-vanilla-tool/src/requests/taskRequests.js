'use strict';

import { callRequestApi } from './callApi.js';
/** @import { TaskInfos } from '../components/Task.js' */

/**
 * Retourne la tâche du jour
 * @returns {TaskInfos} - Tâche du jour
 */
async function getTodayTask() {
  return callRequestApi('task/today');
}

/**
 * Retourne la liste des tâches du jour
 * @returns {Array<TaskInfos>} - Liste des tâches du jour
 */
async function getTodayTasks() {
  return callRequestApi('task/taskTodo', 'GET');
}

/**
 * Sauvegarde une tâche
 * @param {TaskInfos} taskInfos - Tâche à sauvegarder
 * @returns {Promise<TaskInfos>} - Promesse contenant la tache sauvegardée
 */
async function saveTask(taskInfos) {
  return callRequestApi('task/save', 'POST', taskInfos);
}

/**
 * Supprime une tâche
 * @param {TaskInfos} taskInfos - Tâche à supprimer
 * @returns {Promise<TaskInfos>} - Promesse contenant la tâche supprimée
 */
async function deleteTask(taskInfos) {
  return callRequestApi('task/delete', 'POST', taskInfos);
}

export { getTodayTasks, getTodayTask, saveTask, deleteTask };
