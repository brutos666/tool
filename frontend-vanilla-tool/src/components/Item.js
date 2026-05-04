'use strict';

import ItemView from './views/ItemView.js';
import Component from './Component.js';
import { RIGHT } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import Toolbar from './Toolbar.js';
import CheckBox from './CheckBox.js';
/** @import TreeItem from '../data/TreeItem.js' */
/** @import { ITEM_LAYOUT } from '../tools/Constants.js' */
/** @import Items from './Items.js' */

class Item extends Component {

  name = 'Item';
  static EVENTS = { focus: 'itemFocus', current: 'itemCurrent' };

  /** @type {TreeItem} */
  #treeItem = null;
  #readOnly = false;

  #doneCheckbox = null;

  /**
   * @constructor de la classe Item
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {TreeItem} data.treeItem - Informations sur la tache
   * @param {ITEM_LAYOUT} data.layout - Affichage souhaité
   * @param {Array<RIGHT>} data.rights - Droits en création, modification et suppression
   */
  constructor(data) {
    super(new ItemView(data));

    const rights = data.rights;
    const toolbar = new Toolbar();
    if (rights.includes(RIGHT.create)) {
      const addAction = new ActionButton({ id: 'addNewChild', label: 'Ajouter un item', icon: '+', role: 'button', type: 'icon' });
      addAction.setDoActionCallback(this.doAdd.bind(this, 'Nouvel item'));
      toolbar.addChild(addAction);
    }
    if (rights.includes(RIGHT.delete)) {
      const deleteAction = new ActionButton({ id: 'markToDelete', label: 'Marquer à supprimer', icon: '-', role: 'button', type: 'icon' });
      deleteAction.setDoActionCallback(this.markToDelete.bind(this));
      toolbar.addChild(deleteAction);
      const undoToDeleteAction = new ActionButton({ id: 'undoToDelete', label: 'Annuler la suppression', icon: '+', role: 'button', type: 'icon' });
      undoToDeleteAction.setDoActionCallback(this.undoToDelete.bind(this));
      toolbar.addChild(undoToDeleteAction);
    }
    this.setStaticChild('toolbar', toolbar);

    this.#doneCheckbox = new CheckBox({ id: 'done', label: 'Fait', role: 'checkbox', type: 'checkbox' });
    this.#doneCheckbox.setToggleCallback(this.toggleDone.bind(this));
    this.setStaticChild('done', this.#doneCheckbox);

    if (rights.includes(RIGHT.update)) {
      this.getView()
        .setOnChangeCallback(this.setPropertyValue.bind(this));
    } else {
      this.setReadOnly();
    }
    this.getView()
      .setOnFocusCallback(() => {
        this.getView()
          .dispatchEvent(new CustomEvent(Item.EVENTS.focus, { bubbles: true, detail: this }));
      });

    this.setTreeItem(data.treeItem);
  }

  setCurrent() {
    super.setCurrent();
    this.getView()
      .dispatchEvent(new CustomEvent(Item.EVENTS.current, { bubbles: true, detail: this }));
  }

  destroy() {
    this.#treeItem.removeObserver(this);
    super.destroy();
  }

  /**
   * @returns {TreeItem}
   */
  getTreeItem() {
    return this.#treeItem;
  }

  setTreeItem(treeItem) {
    if (this.#treeItem) {
      this.#treeItem.removeObserver(this);
    }
    this.#treeItem = treeItem;
    this.#treeItem.addObserver(this);
    this.setItemValues(this.#treeItem.getItemInfos());
  }

  /**
   * @override
   * @returns {ItemView}
   */
  getView() {
    return super.getView();
  }

  doAdd(title) {
    this.#treeItem.addItem({ title, state: 'TODO', children: [] });
  }
  markToDelete() {
    if (this.#treeItem.isNew()) {
      this.#treeItem.getParentItem()
        .removeItem(this.#treeItem);
    } else {
      this.#treeItem.markToDeleteItem();
    }
  }

  undoToDelete() {
    this.#treeItem.undoToDelete();
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
  toggleDone() {
    const value = this.#doneCheckbox.isChecked() ? 'DONE' : 'TODO';
    this.getTreeItem()
      .setPropertyValue('state', value);
  }

  /**
   * Modification du modèle
   * @param {'update'|'updated'|'toDelete'|'undoToDelete'|'addItem'|'removeItem'} action
   * @param {TreeItem} treeItem
   */
  update(action, treeItem) {
    if (action === 'update') {
      // MAJ éventuelle du status
      this.getView()
        .setCRUDMode(treeItem.getItemInfos().CRUDMode);
    } else if (action === 'updated') {
      this.setItemValues(treeItem.getItemInfos());
    } else if (action === 'toDelete') {
      this.setToDelete();
    } else if (action === 'undoToDelete') {
      this.setUndoToDelete();
    } else if (action === 'removeItem') {
      this.#treeItem.removeObserver(this);
    }
  }

  setItemValues(itemInfos) {
    this.getView()
      .setItemValues(itemInfos);
    if (itemInfos.state) {
      this.#doneCheckbox.setChecked(itemInfos.state === 'DONE');
    }
  }

  setToDelete() {
    this.setDisabled();
    this.getView()
      .setToDelete();
  }

  setUndoToDelete() {
    this.setEnabled();
    if (this.#readOnly) {
      this.setReadOnly();
    }
    this.getView()
      .undoToDelete();
  }

  setReadOnly() {
    super.setReadOnly();
    this.#readOnly = true;
  }

}

export default Item;