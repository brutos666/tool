'use strict';

import ItemView from './views/ItemView.js';
import Component from './Component.js';
/** @import TreeItem from '../data/TreeItem.js' */
/** @import { VIEW_CHOICE } from '../tools/Constants.js' */

class Item extends Component {

  name = 'Item';
  static EVENTS = { focus: 'itemFocus' };

  /** @type {TreeItem} */
  #treeItem = null;
  #layout = null;

  /**
   * @constructor de la classe Item
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {TreeItem} data.treeItem - Informations sur la tache
   * @param {VIEW_CHOICE} data.layout - Affichage souhaité
   */
  constructor(data) {
    super(new ItemView(data));
    this.#treeItem = data.treeItem;
    this.#layout = data.layout;
    this.#treeItem.addObserver(this);

    this.getView()
      .setOnChangeCallback(this.setPropertyValue.bind(this));

    const nodeView = this.getNodeView();
    nodeView.addEventListener('focus', event => {
      if (!this.getNodeView()
        .contains(event.relatedTarget)) {
        nodeView.dispatchEvent(new CustomEvent(Item.EVENTS.focus, { bubbles: true, detail: this.getTreeItem() }));
      }
    }, true);
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
   * @param {VIEW_CHOICE} layout - Affichage souhaité
   */
  doChangeViewChoice(layout) {
    this.#layout = layout;
    super.updateData({ treeItem: this.getTreeItem(), layout: this.#layout });
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
   * @param {'change'|'update'|'delete'|'addChild'} action
   * @param {TreeItem} treeItem
   */
  update(action, treeItem) {
    if (action === 'update') {
      this.getView()
        .setItemValues(treeItem.getItemInfos());
    } else if (action === 'delete') {
      this.removeFromParent();
    }
  }

  setReadOnly(readonly) {
    this.getView()
      .setReadOnly(readonly);
  }

}

export default Item;