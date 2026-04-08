import TreeItemList from './TreeItemList.js';

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
class TreeItem {

  name = 'TreeItem';

  #item;
  /** @type {TreeItemList} */
  #treeItemList;
  /** @type {TreeItemList} */
  #parent;

  #observers = [];
  #updates = {};

  constructor(itemInfos) {
    this.#item = Object.assign({}, {
      id: itemInfos.id,
      title: itemInfos.title,
      text: itemInfos.text,
      state: itemInfos.state,
      parentId: itemInfos.parentId,
      nextId: itemInfos.nextId
    });
    this.#treeItemList = new TreeItemList(itemInfos.children);
  }
  setParent(parent) {
    this.#parent = parent;
  }
  getParent() {
    return this.#parent;
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

  addItem(itemInfos) {
    this.#treeItemList.addItem({ ...itemInfos, parentId: this.#item.id });
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
    for (const observer of this.#observers) {
      observer.update('change', this);
    }
  }

  updateItem(itemInfos) {
    const oldId = this.#item.id;
    Object.assign(this.#item, itemInfos);
    for (const key in itemInfos) {
      delete this.#updates[key];
      if (key === 'id' && itemInfos[key] !== oldId) {
        this.getParent()
          .updatePrevious(this);
      }
    }
    for (const observer of this.#observers) {
      observer.update('update', this);
    }
  }
  deleteItem() {
    for (const observer of this.#observers) {
      observer.update('delete', this);
    }
    this.getParent()
      .removeItem(this);
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

  addObserver(observer) {
    this.#observers.push(observer);
  }
  addObservers(observers) {
    this.#observers = observers;
  }

  removeObserver(observer) {
    const index = this.#observers.indexOf(observer);
    if (index !== -1) {
      this.#observers.splice(index, 1);
    }
  }
  removeObservers() {
    this.#observers = null;
  }

}

export default TreeItem;