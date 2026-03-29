'use strict';

import ClearItem from '../commands/ClearItem.js';
import CreateItem from '../commands/CreateItem.js';
import DeleteItem from '../commands/DeleteItem.js';
import ModifyItem from '../commands/ModifyItem.js';
import Component from './Component.js';
import ItemView from './views/ItemView.js';
import { SAVE_TIMEOUT } from '../tools/Constants.js';
/** @import { VIEW_CHOICE, STATE } from '../tools/Constants.js' */

/**
 * @typedef {Object} ItemInfos - Informations sur une tâche
 * @property {number} id - Identifiant de la tâche
 * @property {string} title - Titre
 * @property {string} text - Description de ce qu'il faut faire
 * @property {STATE} state - État de la tâche
 *                          - TODO : La tâche n'a pas encore été fait
 *                          - IN_PROGRESS : La tâche est en cours
 *                          - DONE : La tâche a been fait
 */
class Item extends Component {

  /** @type {ItemInfos} */
  #itemInfos = null;
  #viewChoice = null;
  #updates = {};
  #saveTimeoutId = null;

  /**
   * @constructor de la classe Item
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {ItemInfos} data.itemInfos - Informations sur la tache
   * @param {VIEW_CHOICE} data.viewChoice - Affichage souhaité
   */
  constructor(data) {
    super(new ItemView(data));
    this.#itemInfos = data.itemInfos;
    this.#viewChoice = data.viewChoice;

    /** @type {ItemView} */
    const itemView = this.getView();
    itemView.setUpdateCallback(this.setPropertyValue.bind(this));
    itemView.setDeleteCallback(this.doDelete.bind(this));
  }
  /**
   * @override
   * @param {Object} data - Données à utiliser pour modifier la vue
   * @param {ItemInfos} data.itemInfos - Informations sur la tache
   * @param {VIEW_CHOICE} data.viewChoice - Affichage souhaité
   */
  updateData(data) {
    if (data.itemInfos) {
      this.#itemInfos = data.itemInfos;
      this.#updates = {};
    }
    if (data.viewChoice) {
      this.#viewChoice = data.viewChoice;
    }
    super.updateData({ itemInfos: this.getItemInfos(), viewChoice: this.#viewChoice });
  }

  majIdentifier() {
    /** @type {ItemView} */
    const itemView = this.getView();
    itemView
      .setIdentify(this.#itemInfos.id);
  }

  /**
   * Retourne les informations de la tâche
   * @returns {ItemInfos} - Informations sur la tache
   */
  getItemInfos() {
    // Prise en compte des modifications en cours
    return { ...this.#itemInfos, ...this.#updates };
  }

  /**
   * Met à jour la tâche en fonction de l'événement reçu
   * @param {string} property - Propriété de la tâche à mettre à jour
   * @param {string} value - Valeur de la propriété
   *
   * @this {Item}
   */
  setPropertyValue(property, value) {
    if (this.#itemInfos[property] === value) {
      delete this.#updates[property];
    } else {
      this.#updates[property] = value;
    }
    if (!this.#saveTimeoutId) {
      this.#saveTimeoutId = setTimeout(() => {
        this.doSave();
        this.#saveTimeoutId = null;
      }, SAVE_TIMEOUT);
    }
  }
  /**
   * Sauvegarde d'un item
   */
  doSave() {
    if (this.isNew()) {
      new CreateItem(this)
        .execute();
    } else if (this.isModified()) {
      new ModifyItem(this)
        .execute();
    }
  }
  /**
   * Suppression d'un item
   */
  doDelete() {
    clearTimeout(this.timeoutID);
    if (this.isNew()) {
      new ClearItem(this)
        .execute();
    } else {
      new DeleteItem(this)
        .execute();
    }
  }

  isNew() {
    return !this.getItemInfos().id;
  }
  isModified() {
    return Object.keys(this.#updates).length > 0;
  }

}

export default Item;