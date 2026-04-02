'use strict';

import DeleteItem from '../commands/DeleteItem.js';
import SaveItem from '../commands/SaveItem.js';
import ItemView from './views/ItemView.js';
import ActionButton from './ActionButton.js';
import { SAVE_TIMEOUT, NOTIFICATION_TIMEOUT } from '../tools/Constants.js';
import Composite from './Composite.js';
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

  name = 'Item';

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
    // TODO : décorateur de commande
    super(new ItemView(data));
    this.#itemInfos = data.itemInfos;
    this.#viewChoice = data.viewChoice;

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
   * @returns {ItemView}
   */
  getView() {
    return super.getView();
  }
  /**
   * @override
   */
  doRemoveFromParent() {
    const nextId = this.getItemInfos().nextId;
    if (nextId !== undefined) {
      this.majPrevious(nextId);
    }
    super.doRemoveFromParent();
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
  /**
   * @override
   */
  commandInProgress(name) {
    super.commandInProgress(name);

    if (name === 'SaveItem') {
      this.#saveUpdates = this.#updates;
      this.#updates = {};
    } else if (name === 'DeleteItem') {
      this.#deleteInProgress = true;
    }
    this.doStopSave();
  }

  /**
   * @override
   */
  commandDone(name, itemInfos) {
    super.commandDone(name, itemInfos);

    if (name === 'SaveItem') {
      if (this.isNew()) {
        this.majIdentify(itemInfos.id);
      }
      this.#itemInfos = itemInfos;
      this.#saveUpdates = {};
      this.doRestartSave();
    } else if (name === 'DeleteItem') {
      this.setDisabled(true);
      setTimeout(() => this.doRemoveFromParent(), NOTIFICATION_TIMEOUT);
      this.#deleteInProgress = false;
    }
  }

  /**
   * @override
   */
  commandFailed(name) {
    super.commandFailed(name);

    if (name === 'SaveItem') {
      this.#updates = { ...this.#saveUpdates, ...this.#updates };
      this.#saveUpdates = {};
      this.addChild(getRelaunchSaveButton());
    } else if (name === 'DeleteItem') {
      this.#deleteInProgress = false;
      this.doRestartSave();
    }
  }

  majIdentify(identify) {
    this.#itemInfos.id = identify;
    this.getView()
      .setIdentify(identify);
    this.majPrevious(identify);
  }

  majPrevious(nextId) {
    // Mettre à jour l'enfant précédent
    /** @type {Item} */
    const previous = this.getPrevious();
    if (previous) {
      previous.setPropertyValue('nextId', nextId);
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

  /** -- fonction de sauvegarde avec timer */
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

  isLeaf() {
    return !this.getItemInfos().children || this.getItemInfos().children.length === 0;
  }

}
/**
 * Ajout d'un bouton pour lancer la sauvegarde manuellement
 */
function getRelaunchSaveButton() {
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
}

export default Item;