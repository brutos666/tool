'use strict';

import ItemView from './views/ItemView.js';
import Component from './Component.js';
import { RIGHT } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import Toolbar from './Toolbar.js';
/** @import TreeItem from '../data/TreeItem.js' */
/** @import { ITEM_LAYOUT } from '../tools/Constants.js' */
/** @import Items from './Items.js' */

class Item extends Component {

  name = 'Item';

  /** @type {Items} */
  #parentContainer = null;

  /** @type {TreeItem} */
  #treeItem = null;
  #layout = null;
  #rights;

  /**
   * @constructor de la classe Item
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {TreeItem} data.treeItem - Informations sur la tache
   * @param {ITEM_LAYOUT} data.layout - Affichage souhaité
   * @param {Array<RIGHT>} data.rights - Droits en création, modification et suppression
   */
  constructor(data) {
    super(new ItemView(data));
    this.setData(data);

    const toolbar = new Toolbar();

    if (data.rights.includes(RIGHT.create)) {
      const addAction = new ActionButton({ id: 'addNewChild', label: '+' });
      addAction.setDoActionCallback(this.doAdd.bind(this, 'Nouvel item'));
      toolbar.addChild(addAction);
    }
    if (data.rights.includes(RIGHT.delete)) {
      const deleteAction = new ActionButton({ id: 'deleteItem', label: 'X' });
      deleteAction.setDoActionCallback(this.doDelete.bind(this));
      toolbar.addChild(deleteAction);
    }
    this.setStaticChild('toolbar', toolbar);
  }

  setParentContainer(parentContainer) {
    this.#parentContainer = parentContainer;
  }

  /** @override  */
  updateData(data) {
    this.setData(data);
    super.updateData(data);
  }

  setData(data) {
    if (this.#treeItem) {
      this.#treeItem.removeObserver(this);
    }
    this.#treeItem = data.treeItem;
    this.#layout = data.layout;
    this.#rights = data.rights;
    this.#treeItem.addObserver(this, data.rights);
    if (this.#rights.includes(RIGHT.update)) {
      this.getView()
        .setOnChangeCallback(this.setPropertyValue.bind(this));
    }
  }

  /**
   * @returns {TreeItem}
   */
  getTreeItem() {
    return this.#treeItem;
  }

  /**
   * @override
   * @returns {ItemView}
   */
  getView() {
    return super.getView();
  }

  /**
   * Changement de l'affichage de l'item
   * @param {ITEM_LAYOUT} layout - Affichage souhaité
   */
  doChangeViewChoice(layout) {
    this.#layout = layout;
    super.updateData({ treeItem: this.getTreeItem(), layout: this.#layout, rights: this.#rights });
  }

  doAdd(title) {
    this.#treeItem.addItem({ title, state: 'TODO', children: [] });
  }
  doDelete() {
    if (this.#parentContainer === null) {
      return;
    }
    this.#parentContainer.doDelete(this.#treeItem);
  }

  /**
   * Met à jour la tâche en fonction de l'événement reçu
   * @param {string} property - Propriété de la tâche à mettre à jour
   * @param {string} value - Valeur de la propriété
   *
   * @this {Item}
   */
  setPropertyValue(property, value) {
    this.getTreeItem()
      .setPropertyValue(property, value);
  }

  /**
   * Modification du modèle
   * @param {'update'|'updated'|'deleted'|'addItem'|'removeItem'} action
   * @param {TreeItem} treeItem
   */
  update(action, treeItem) {
    if (action === 'updated') {
      this.getView()
        .setItemValues(treeItem.getItemInfos());
    } else if (action === 'deleted') {
      this.#treeItem.removeObserver(this);
    }
  }

}

export default Item;