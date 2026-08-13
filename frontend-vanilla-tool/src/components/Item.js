'use strict';

import { ITEM_LAYOUT, RIGHT } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import CheckBox from './CheckBox.js';
import Component from './Component.js';
import TabFocusManager from './TabFocusManager.js';
import TextInput from './TextInput.js';
import Toolbar from './Toolbar.js';
import ItemView from './views/ItemView.js';
/** @import TreeItem from '../data/TreeItem.js' */
/** @import Items from './Items.js' */

class Item extends Component {

  name = 'Item';
  static EVENTS = { current: 'itemCurrent' };

  /** @type {TreeItem} */
  #treeItem = null;
  #readOnly = false;

  /** @type {CheckBox} */
  #doneCheckbox = null;
  /** @type {TextInput} */
  #titleInput = null;
  /** @type {TextInput} */
  #textInput = null;
  /** @type {Toolbar} */
  #toolbar = null;
  /** @type {ActionButton} */
  #addAction = null;
  /** @type {ActionButton} */
  #deleteAction = null;
  /** @type {ActionButton} */
  #undoToDeleteAction = null;

  /**
   * @constructor de la classe Item
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {TreeItem} data.treeItem - Informations sur la tache
   * @param {ITEM_LAYOUT} data.layout - Affichage souhaité
   * @param {Array<RIGHT>} data.rights - Droits en création, modification et suppression
   */
  constructor(data) {
    super(new ItemView(data));

    const focusManager = new TabFocusManager(this.getElementView(), 'horizontal', true);
    super.setFocusManager(focusManager);

    const rights = data.rights;
    const layout = data.layout;
    const updateRight = rights.includes(RIGHT.update);

    this.#doneCheckbox = this.initDone(layout, updateRight);
    if (this.#doneCheckbox) {
      this.setStaticChild('done', this.#doneCheckbox);
      focusManager.addComponent(this.#doneCheckbox);
    }

    this.#titleInput = this.initTitle(updateRight);
    this.setStaticChild('title', this.#titleInput);
    focusManager.addComponent(this.#titleInput);

    this.#textInput = this.initText(updateRight);
    if (this.#textInput) {
      this.setStaticChild('text', this.#textInput);
      focusManager.addComponent(this.#textInput);
    }

    this.#toolbar = this.initToolbar(rights);
    if (this.#toolbar) {
      this.setStaticChild('toolbar', this.#toolbar);
      focusManager.addComponent(this.#toolbar);
    }

    if (!updateRight) {
      this.setReadOnly();
    }
    this.setTreeItem(data.treeItem);
  }

  initDone(layout, updateRight) {
    if (!ITEM_LAYOUT.hasDone(layout)) {
      return null;
    }
    const done = new CheckBox({ id: 'done', label: 'Fait', role: 'checkbox', type: 'checkbox' });
    if (updateRight) {
      done.setToggleCallback(this.toggleDone.bind(this));
    }
    return done;
  }
  initTitle(updateRight) {
    const title = new TextInput();
    if (updateRight) {
      title.setOnChangeCallback(this.onChange.bind(this, title, 'title'));
    }
    return title;
  }
  initText(layout, updateRight) {
    if (!ITEM_LAYOUT.hasText(layout)) {
      return null;
    }
    const text = new TextInput();
    if (updateRight) {
      text.setOnChangeCallback(this.onChange.bind(this, text, 'text'));
    }
    return text;
  }
  initToolbar(rights) {
    const createRight = rights.includes(RIGHT.create);
    const deleteRight = rights.includes(RIGHT.delete);
    if (!createRight && !deleteRight) {
      return null;
    }
    const toolbar = new Toolbar();
    if (createRight) {
      this.#addAction = new ActionButton({ id: 'addNewChild', label: 'Ajouter un item', icon: '+', role: 'button', type: 'icon' });
      this.#addAction.setDoActionCallback(this.doAdd.bind(this, 'Nouvel item'));
      toolbar.addChild(this.#addAction);
    }
    if (deleteRight) {
      this.#deleteAction = new ActionButton({ id: 'markToDelete', label: 'Marquer à supprimer', icon: '-', role: 'button', type: 'icon' });
      this.#deleteAction.setDoActionCallback(this.markToDelete.bind(this));
      this.#undoToDeleteAction = new ActionButton({ id: 'undoToDelete', label: 'Annuler la suppression', icon: '+', role: 'button', type: 'icon' });
      this.#undoToDeleteAction.setDoActionCallback(this.undoToDelete.bind(this));
      this.#undoToDeleteAction.setHidden();
      toolbar.addChild(this.#deleteAction);
      toolbar.addChild(this.#undoToDeleteAction);
    }
    return toolbar;
  }

  setCurrent() {
    super.setCurrent();
    this.getView()
      .dispatchEvent(new CustomEvent(Item.EVENTS.current, { bubbles: true, detail: this }));
  }

  destroy() {
    this.#treeItem.removeObserver(this);
    if (this.isCurrent()) {
      this.getView()
        .dispatchEvent(new CustomEvent(Item.EVENTS.current, { bubbles: true, detail: null }));
    }
    super.destroy();
  }

  /**
   * @returns {TreeItem}
   */
  getTreeItem() {
    return this.#treeItem;
  }

  /**
   *
   * @param {TreeItem} treeItem
   */
  setTreeItem(treeItem) {
    if (this.#treeItem) {
      this.#treeItem.removeObserver(this);
    }
    this.#treeItem = treeItem;
    this.#treeItem.addObserver(this);
    if (this.#treeItem.isDeleted()) {
      this.setToDelete();
    } else {
      this.setUndoToDelete();
    }

    this.setItemValues(this.#treeItem.getItemInfos());
    this.setTreeItemId(treeItem.getTreeItemId());
  }

  setTreeItemId(treeItemId) {
    this.getView()
      .setTreeItemId(treeItemId);
  }

  /**
   * @override
   * @returns {ItemView}
   */
  getView() {
    return super.getView();
  }

  doAdd(title) {
    this.#treeItem.addChildItem({ title, state: 'TODO', children: [] });
  }

  markToDelete() {
    if (this.#treeItem.isNew()) {
      this.#treeItem.getParentItem()
        .removeChildItem(this.#treeItem);
    } else {
      this.#treeItem.markToDeleteItem();
    }
  }
  undoToDelete() {
    this.#treeItem.undoToDelete();
  }

  toggleDone() {
    const value = this.#doneCheckbox.isChecked() ? 'DONE' : 'TODO';
    this.getTreeItem()
      .setPropertyValue('state', value);
  }
  onChange(textInput, property) {
    this.getTreeItem()
      .setPropertyValue(property, textInput.getValue());
  }

  /**
   * Modification du modèle
   * @param {'modify'|'added'|'updated'|'toDelete'|'undoToDelete'|'removed'|'addChildItem'|'removeChildItem'} action
   * @param {TreeItem} treeItem
   */
  update(action, treeItem) {
    if (action === 'modify') {
      // MAJ éventuelle du status
      this.getView()
        .setCRUDMode(treeItem.getItemInfos().CRUDMode);
    } else if (action === 'updated') {
      this.setItemValues(treeItem.getItemInfos());
    } else if (action === 'toDelete') {
      this.setToDelete();
      this.getFocusManager()
        .refreshCurrent();
    } else if (action === 'undoToDelete') {
      this.setUndoToDelete();
      this.getFocusManager()
        .refreshCurrent();
    }
  }

  setItemValues(itemInfos) {
    this.getView()
      .setItemValues(itemInfos);
    if (itemInfos.state) {
      this.#doneCheckbox?.setChecked(itemInfos.state === 'DONE');
    }
    this.#titleInput.setValue(itemInfos.title);
    this.#textInput?.setValue(itemInfos.text);
  }

  setToDelete() {
    const parentIsToDelete = this.#treeItem.getParentItem()
      ?.isDeleted();
    /*
     * NOTE : Ne pas rendre la toolbar inaccessible car elle est utile même si l'item est supprimé
     */
    this.#doneCheckbox?.setDisabled();
    this.#titleInput.setDisabled();
    this.#textInput?.setDisabled();
    if (this.#toolbar) {
      // Cacher tous les enfants dont le bouton de drag&drop sauf l'annulation de suppression
      this.#toolbar.getChildren()
        .forEach(btn => {
          if (!parentIsToDelete && btn === this.#undoToDeleteAction) {
            this.#undoToDeleteAction.setVisible();
          } else {
            btn.setHidden();
          }
        });
    }
    this.getView()
      .setToDelete();
  }

  setUndoToDelete() {
    // NOTE : Ne pas rendre la toolbar inaccessible car elle est utile même si l'item est supprimé (donc pas de super.setDisabled())
    this.#doneCheckbox?.setEnabled();
    this.#titleInput.setEnabled();
    this.#textInput?.setEnabled();
    if (this.#toolbar) {
      // Afficher tous les enfants dont le bouton de drag&drop sauf l'annulation de suppression
      this.#toolbar.getChildren()
        .forEach(btn => {
          if (btn === this.#undoToDeleteAction) {
            this.#undoToDeleteAction.setHidden();
          } else {
            btn.setVisible();
          }
        });
    }
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