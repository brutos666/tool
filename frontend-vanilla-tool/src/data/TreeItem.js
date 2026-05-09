import TreeItemList from './TreeItemList.js';
import { CRUD_MODE } from '../tools/Constants.js';
import StoreData from './StoreData.js';
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
 * @property {Array<ItemInfos>} children - Enfants (arbre)
 * @property {STATUS} status - Statut {@link STATUS}
 * @property {CRUD_MODE} CRUDMode - Création, modification, suppression ou lecture {@link CRUD_MODE}
 */
class TreeItem {

  name = 'TreeItem';

  #treeItemId;

  #item;
  /** @type {TreeItemList} */
  #treeItemList;
  /** @type {TreeItem} */
  #parentItem;

  /** @type {Array<Component>} */
  #observers = [];
  /** Modification effectuées */
  #updates = {};
  #deleted = false;
  #moved = false;

  constructor(itemInfos) {
    this.#item = Object.assign({}, {
      id: itemInfos.id,
      title: itemInfos.title,
      text: itemInfos.text,
      state: itemInfos.state,
      status: itemInfos.status
    });
    this.#treeItemList = new TreeItemList();
    this.#treeItemList.setItems(this, itemInfos.children);
    this.#treeItemId = StoreData.giveTreeItemNewId();
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
  getTreeItemId() {
    return this.#treeItemId;
  }

  getItemByTreeItemId(treeItemId) {
    if (treeItemId === this.#treeItemId) {
      return this;
    }
    for (const child of this.#treeItemList.getTreeList()) {
      const item = child.getItemByTreeItemId(treeItemId);
      if (item) {
        return item;
      }
    }
    return null;
  }
  /**
   * Retourne les informations de la tâche
   * @returns {ItemInfos} - Informations sur la tache
   */
  getItemInfos() {
    // Prise en compte des modifications en cours
    return { ...this.#item, ...this.#updates, children: this.#treeItemList.getItemInfos(), CRUDMode: this.getCRUDMode() };
  }

  getTreeItemList() {
    return this.#treeItemList;
  }

  getCRUDMode() {
    if (this.isNew()) {
      return CRUD_MODE.CREATE;
    }
    if (this.isDeleted()) {
      return CRUD_MODE.DELETE;
    }
    if (this.isModified()) {
      return CRUD_MODE.UPDATE;
    }
    return CRUD_MODE.READ;
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
    this.alertObservers('modify');
  }

  addChildItem(itemInfos) {
    this.addItem(new TreeItem(itemInfos));
  }

  addItem(childTreeItem) {
    this.alertObservers('addChildItem');
    this.#treeItemList.addItem(this, childTreeItem);
  }

  getPrevious() {
    if (!this.getParentItem()) {
      return null;
    }
    return this.getParentItem()
      .getTreeItemList()
      .getPrevious(this);
  }

  getNext() {
    if (!this.getParentItem()) {
      return null;
    }
    return this.getParentItem()
      .getTreeItemList()
      .getNext(this);
  }

  /**
   * Suppression d'un item fils
   * @param {TreeItem} treeItemToRemove - Item à supprimer
   */
  removeChildItem(treeItemToRemove) {
    this.#treeItemList.removeItem(treeItemToRemove);
    this.alertObservers('removeChildItem');
  }

  updateItem(itemInfos) {
    Object.assign(this.#item, itemInfos);
    for (const key in itemInfos) {
      delete this.#updates[key];
    }
    this.alertObservers('updated');
  }
  markToDeleteItem() {
    this.#deleted = true;
    for (const childItem of this.#treeItemList.getTreeList()) {
      childItem.markToDeleteItem();
    }
    this.alertObservers('toDelete');
  }

  markAsMoved() {
    this.#moved = true;
    this.alertObservers('updated');
  }

  moveItemInto(itemId, intoItemId) {
    /** @type {TreeItem} */
    const treeItem = this.getItemByTreeItemId(itemId);
    if (treeItem) {
      treeItem.getParentItem()
        .removeChildItem(treeItem);
    }
    /** @type {TreeItem} */
    const intoTreeItem = this.getItemByTreeItemId(intoItemId);
    if (intoTreeItem) {
      intoTreeItem.addItem(treeItem);
      treeItem.markAsMoved();
    }
  }

  isChildOf(childId, parentId) {
    const childTreeItem = this.getItemByTreeItemId(childId);
    const parentTreeItem = this.getItemByTreeItemId(parentId);
    return childTreeItem.hasParent(parentTreeItem);
  }

  hasParent(treeItem) {
    if (this.getParentItem() === treeItem) {
      return true;
    }
    return this.getParentItem()
      ?.hasParent(treeItem);
  }

  undoToDelete() {
    this.#deleted = false;
    for (const childItem of this.#treeItemList.getTreeList()) {
      childItem.undoToDelete();
    }
    this.alertObservers('undoToDelete');
  }

  /**
   *
   * @param {'modify'|'added'|'updated'|'toDelete'|'undoToDelete'|'removed'|'addChildItem'|'removeChildItem'} action
   */
  alertObservers(action) {
    /*
     * NOTE : La liste des observers peut être modifiée si par exemple on alerte de la suppression d'un item
     * On va donc travailler sur une copie
     */
    const observers = this.#observers.slice();
    for (const observer of observers) {
      observer.update(action, this);
    }
  }

  isLeaf() {
    return this.#treeItemList.getTreeList().length === 0;
  }
  isRoot() {
    return this.getParentItem()
      .getItemId() === -1;
  }
  /**
   * @returns {boolean} - Indique si la tâche est nouvelle
   */
  isNew() {
    return !this.#item.id && !this.#updates.id;
  }
  /**
   * @returns {boolean} - Indique si la tâche a des modifications
   */
  isModified() {
    return Object.keys(this.#updates).length > 0 || this.#moved;
  }

  isDeleted() {
    return this.#deleted;
  }

  addObserver(observer) {
    this.#observers.push(observer);
  }

  removeObserver(observer) {
    const index = this.#observers.indexOf(observer);
    if (index !== -1) {
      this.#observers.splice(index, 1);
    }
  }

}

export default TreeItem;