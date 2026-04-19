'use strict';

import CallRequest from './CallRequest.js';
/** @import {ItemInfos} from '../data/TreeItem.js'; */
/** @import {ItemToSave} from '../components/decorators/CommandSaveDecorator.js'; */

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
   * @param {ItemToSave} itemToSave - Tâche à sauvegarder,ses enfants, l'item précédent et l'identifiant du suivant
   * @returns {Promise<ItemToSave>} - Promesse contenant la tache sauvegardée
   */
  async saveItem(itemToSave) {
    return new CallRequest()
      .execute('item/save', 'POST', itemToSave);
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
