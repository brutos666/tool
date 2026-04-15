import TreeItemList from './TreeItemList.js';
/** @import Component from '../components/Component.js'; */
/** @import { STATE, STATUS } from '../tools/Constants.js'; */

/**
 * @typedef {Object} ItemInfos - Informations sur l'item
 * @property {number} id - Identifiant
 * @property {string} title - Titre
 * @property {string} text - Description de ce qu'il faut faire
 * @property {STATE} state - État {@link STATE}
 *                          - TODO : A faire
 *                          - IN_PROGRESS : En cours
 *                          - DONE : Fait
 * @property {number} parentId - Identifiant de l'item parent
 * @property {number} nextId - Identifiant de l'item suivant
 * @property {Array<ItemInfos>} children - Enfants (arbre)
 * @property {STATUS} status - Statut {@link STATUS}
 */
class TreeItem {

  name = 'TreeItem';

  #item;
  /** @type {TreeItemList} */
  #treeItemList;
  /** @type {TreeItem} */
  #parentItem;

  /** @type {Array<Object.<Component, Array<RIGHT>>>} */
  #observers = [];
  /** Modification effectuées */
  #updates = {};

  constructor(itemInfos) {
    this.#item = Object.assign({}, {
      id: itemInfos.id,
      title: itemInfos.title,
      text: itemInfos.text,
      state: itemInfos.state,
      parentId: itemInfos.parentId,
      nextId: itemInfos.nextId,
      status: itemInfos.status
    });
    this.#treeItemList = new TreeItemList();
    this.#treeItemList.setItems(this, itemInfos.children);
  }
  setParentItem(parentItem) {
    this.#parentItem = parentItem;
  }
  getParentItem() {
    return this.#parentItem;
  }

  getItemId() {
    return this.#item.id;
  }
  /**
   * Retourne les informations de la tâche
   * @returns {ItemInfos} - Informations sur la tache
   */
  getItemInfos() {
    // Prise en compte des modifications en cours
    return { ...this.#item, ...this.#updates, children: this.#treeItemList.getItemInfos() };
  }

  getTreeItemList() {
    return this.#treeItemList;
  }

  /**
   * Met à jour la tâche en fonction de l'événement reçu
   * @param {string} property - Propriété de la tâche à mettre à jour
   * @param {string} value - Valeur de la propriété
   *
   * @this {TreeItem}
   */
  setPropertyValue(property, value) {
    const itemInfos = this.#item;
    if (itemInfos[property] === value) {
      delete this.#updates[property];
    } else {
      this.#updates[property] = value;
    }
    this.alertObservers('update');
  }

  addItem(itemInfos) {
    this.#treeItemList.addItem(this, { ...itemInfos, parentId: this.#item.id });
    this.alertObservers('addItem');
  }
  getPrevious() {
    return this.getParentItem()
      .getTreeItemList()
      .getPrevious(this);
  }

  /**
   * Suppression d'un item
   * @param {TreeItem} treeItemToRemove - Item à supprimer
   */
  removeItem(treeItemToRemove) {
    this.#treeItemList.removeItem(treeItemToRemove);
    this.alertObservers('removeItem');
  }

  updatePrevious(treeItem) {
    this.#treeItemList.updatePrevious(treeItem);
  }

  updateItem(itemInfos) {
    const oldId = this.#item.id;
    Object.assign(this.#item, itemInfos);
    for (const key in itemInfos) {
      delete this.#updates[key];
      if (key === 'id' && itemInfos[key] !== oldId) {
        this.getParentItem()
          .updatePrevious(this);
      }
    }
    this.alertObservers('updated');
  }
  deleteItem() {
    this.getParentItem()
      .removeItem(this);
    this.alertObservers('deleted');
  }

  /**
   *
   * @param {'update'|'updated'|'deleted'|'addItem'|'removeItem'} action
   */
  alertObservers(action) {
    for (const observerObject of this.#observers) {
      /** @type {Component} */
      const observer = observerObject.observer;
      observer.update(action, this);
    }
  }

  isLeaf() {
    return this.#treeItemList.getTreeList().length === 0;
  }
  isRoot() {
    return this.#item.parentId === undefined || this.#item.parentId === -1;
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

  isNextIdModified() {
    return this.#updates.nextId !== undefined;
  }

  addObserver(observer, rights) {
    this.#observers.push({ observer, rights });
  }

  removeObserver(observer) {
    const index = this.#observers.findIndex(observerObject => observerObject.observer === observer);
    if (index !== -1) {
      this.#observers.splice(index, 1);
    }
  }

}

export default TreeItem;