'use strict';

import CallRequest from './CallRequest.js';
/** @import { ItemInfos } from '../components/Item.js' */

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
   * @param {ItemInfos} itemInfos - Tâche à sauvegarder
   * @returns {Promise<ItemInfos>} - Promesse contenant la tache sauvegardée
   */
  async saveItem(itemInfos) {
    return new CallRequest()
      .execute('item/save', 'POST', itemInfos);
  }

  /**
   * Supprime une tâche
   * @param {ItemInfos} itemInfos - Tâche à supprimer
   * @returns {Promise<ItemInfos>} - Promesse contenant la tâche supprimée
   */
  async deleteItem(itemInfos) {
    return new CallRequest()
      .execute('item/delete', 'POST', itemInfos);
  }

}
export default ItemCallsRequests;
