'use strict';

import Composite from './Composite.js';
import DeleteItem from '../commands/DeleteItem.js';
import SaveItem from '../commands/SaveItem.js';
import ItemView from './views/ItemView.js';
import ActionButton from './ActionButton.js';
import { SAVE_TIMEOUT, NOTIFICATION_TIMEOUT } from '../tools/Constants.js';
/** @import { VIEW_CHOICE, STATE } from '../tools/Constants.js' */

/**
 * @typedef {Object} ItemInfos - Informations sur l'item
 * @property {number} id - Identifiant
 * @property {string} title - Titre
 * @property {string} text - Description de ce qu'il faut faire
 * @property {STATE} state - État
 *                          - TODO : A faire
 *                          - IN_PROGRESS : En cours
 *                          - DONE : Fait
 * @property {number} parentId - Identifiant de l'item parent
 * @property {number} nextId - Identifiant de l'item suivant
 * @property {Array<ItemInfos>} children - Enfants (arbre)
 */
class Item extends Composite {

  /** @type {ItemInfos} */
  #itemInfos = null;
  #viewChoice = null;
  #updates = {};

  #saveUpdates = {};
  #deleteInProgress = false;
  #saveTimeoutId = null;
  #stopSave = false;

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
    itemView.setDoAddChildCallback(this.doAddChild.bind(this));
    itemView.setDoDeleteCallback(this.doDelete.bind(this));

    if (this.#itemInfos.children) {
      for (const child of this.#itemInfos.children) {
        this.addChild(new Item({ itemInfos: child, viewChoice: this.#viewChoice }));
      }
    }
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

  majIdentify(identify) {
    this.#itemInfos.id = identify;
    /** @type {ItemView} */
    const itemView = this.getView();
    itemView
      .setIdentify(identify);

    // Mettre à jour l'enfant précédent
    /** @type {Item} */
    const previous = this.getPrevious();
    if (previous) {
      previous.setPropertyValue('nextId', identify);
    }
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
    this.doSaveAfterDelay();
  }

  /**
   * Survient lorsque la sauvegarde d'un item va commencer
   */
  saveInProgress() {
    this.#saveUpdates = this.#updates;
    this.#updates = {};
    this.doStopSave();
  }
  /**
   * Survient lorsque la sauvegarde d'un item a fonctionné
   * @param {ItemInfos} itemInfos - Informations sur l'item sauvegardé
   */
  saveDone(itemInfos) {
    if (this.isNew()) {
      this.majIdentify(itemInfos.id);
    }
    this.#itemInfos = itemInfos;
    this.#saveUpdates = {};
    this.doRestartSave();
  }
  /**
   * Survient lorsque la sauvegarde d'un item a échoué
   */
  saveFailed() {
    this.#updates = { ...this.#saveUpdates, ...this.#updates };
    this.#saveUpdates = {};
    /*
     * Si la sauvegarde a échouée, c'est qu'il y a un problème à résoudre. On ne peut pas relancer la sauvegarde automatique tant que le problème est pas résolu. Ajout d'un bouton pour relancer la sauvegarde
     */
    const saveButton = new ActionButton({
      id: 'saveButton',
      label: 'Relancer la sauvegarde'
    });
    saveButton.setDoActionCallback(() => {
      this.doSave()
        .then(() => saveButton.doRemoveFromParent());
    });
    this.addChild(saveButton);
  }
  /**
   * Survient lorsque la suppression d'un item va commencer
   */
  deleteInProgress() {
    this.#deleteInProgress = true;
    this.doStopSave();
  }
  /**
   * Survient lorsque la suppression d'un item a fonctionné
   */
  deleteDone() {
    this.setDisabled(true);
    setTimeout(() => this.doRemoveFromParent(), NOTIFICATION_TIMEOUT);
    this.#deleteInProgress = false;
  }
  /**
   * Survient lorsque la suppression d'un item a échoué
   */
  deleteFailed() {
    this.#deleteInProgress = false;
    this.doRestartSave();
  }
  doStopSave() {
    this.#stopSave = true;
    clearTimeout(this.#saveTimeoutId);
    this.#saveTimeoutId = null;
  }
  doRestartSave() {
    this.#stopSave = false;
    this.doSaveAfterDelay();
  }
  doSaveAfterDelay() {
    if (!this.#stopSave && !this.#saveTimeoutId && Object.keys(this.#updates).length > 0) {
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
    if (this.#deleteInProgress) {
      return;
    }
    return new SaveItem(this)
      .execute();
  }
  /**
   * Suppression d'un item
   */
  doDelete() {
    clearTimeout(this.timeoutID);
    return new DeleteItem(this)
      .execute();
  }
  /**
   * Ajout d'un enfant
   */
  doAddChild() {
    this.addChild(new Item({
      itemInfos: { parentId: this.getItemInfos().id },
      viewChoice: this.#viewChoice
    }));
  }

  /**
   * @returns {boolean} - Indique si la tâche est nouvelle
   */
  isNew() {
    return !this.getItemInfos().id;
  }
  /**
   * @returns {boolean} - Indique si la tâche a des modifications
   */
  isModified() {
    return Object.keys(this.#updates).length > 0;
  }

}

export default Item;