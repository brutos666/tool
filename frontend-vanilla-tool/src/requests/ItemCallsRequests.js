'use strict';

import CallRequest from './CallRequest.js';
/** @import {ItemInfos} from '../data/TreeItem.js'; */

/**
 * @typedef {Object} TreeInfos - Informations sur l'item
 * @property {ItemInfos} item - Item à sauvegarder avec ses enfants
 * @property {number} previousItemId - Identifiant de l'item précédent
 * @property {number} parentItemId - Identifiant de l'item suivant
 * @property {number} nextItemId - Identifiant de l'item suivant
 */
class ItemCallsRequests {

  constructor() {
  }

  /**
   * Retourne la liste des tâches du jour
   * @returns {Array<ItemInfos>} - Liste des tâches du jour
   */
  async getAllItems() {
    return new CallRequest()
      .execute('item/findAllItems', 'GET');
  }

  /**
   * Sauvegarde une tâche
   * @param {TreeInfos} treeInfos - Tâche à sauvegarder,ses enfants, l'identifiant du précédent et du suivant
   * @returns {Promise<TreeInfos>} - Promesse contenant la tache sauvegardée
   */
  async saveItem(treeInfos) {
    return new CallRequest()
      .execute('item/save', 'POST', treeInfos);
  }

}
export default ItemCallsRequests;
