import { ITEM_LAYOUT, RIGHT } from '../tools/Constants.js';
import Composite from './Composite.js';
import CommandItemDecorator from './decorators/CommandItemDecorator.js';
import Item from './Item.js';
/** @import TreeItem from '../data/TreeItem.js'; */
/** @import TreeItemList from '../data/TreeItemList.js'; */
/** @import CompositeView from './CompositeView.js'; */

class Items extends Composite {

  /** @type {ITEM_LAYOUT} */
  #itemLayout;
  /** @type {TreeItemList} */
  #treeItemList;

  /**
   * @constructor
   * @param {CompositeView} view
   * @param {TreeItemList} treeItemList
   * @param {ITEM_LAYOUT} itemLayout
   */
  constructor(view, treeItemList, itemLayout) {
    super(view);
    this.#itemLayout = itemLayout;
    this.#treeItemList = treeItemList;
    this.addItems(treeItemList.getTreeList());

    treeItemList.addObserver(this);
  }
  getLayout() {
    return this.#itemLayout;
  }
  getTreeItemList() {
    return this.#treeItemList;
  }
  setTreeItemList(treeItemList) {
    this.#treeItemList.removeObserver(this);
    treeItemList.addObserver(this);
    this.#treeItemList = treeItemList;
    this.removeAllItems();
    this.addItems(treeItemList.getTreeList());
  }

  /**
   * Modification du modèle
   * @param {'remove'|'add'|'replaceAll'} action
   * @param {Array<TreeItem>} treeItemArray
   */
  update(action, treeItemArray) {
    if (action === 'replaceAll') {
      this.replaceAllItems(treeItemArray);
    } else if (action === 'add') {
      this.addItems(treeItemArray);
    } else if (action === 'remove') {
      this.removeItems(treeItemArray);
    }
  }

  /**
   * Replacement de tous les items
   * @param {Array<TreeItem>} treeItemArray
   */
  replaceAllItems(treeItemArray) {
    this.removeAllItems();
    this.addItems(treeItemArray);
  }
  /**
   * Ajout d'un ou plusieurs items
   * @param {Array<TreeItem>} treeItemArray
   */
  addItems(treeItemArray) {
    treeItemArray.forEach(treeItem => {
      this.addItem(treeItem);
    });
  }

  /**
   * Suppression d'un ou plusieurs items
   * @param {Array<TreeItem>} treeItemArray
   */
  removeItems(treeItemArray) {
    treeItemArray.forEach(treeItem => {
      this.removeItem(treeItem);
    });
  }

  /**
   *******************************************************************
   * Ces méthodes sont à réécrire dans la classe dérivée si nécessaire
   *******************************************************************
   */
  /**
   * Ajout d'un item
   * @param {TreeItem} treeItem - Item à ajouter
   */
  addItem(treeItem) {
    const itemRights = this.getLayout() === ITEM_LAYOUT.Title ? [] : [ RIGHT.create, RIGHT.update, RIGHT.delete ];
    const rights = treeItem.isRoot() ? [ RIGHT.update, RIGHT.delete ] : itemRights;
    const readOnly = !rights.includes(RIGHT.update);
    const item = new Item({ treeItem, layout: this.getLayout(), rights });
    if (readOnly) {
      super.addChild(item);
      return;
    }
    // Mise en place du décorateur permettant la validation en base de données
    const commandItem = new CommandItemDecorator(item, { treeItem, rights });
    super.addChild(commandItem);
  }
  removeAllItems() {
    this.removeAllChildren();
  }
  removeItem(treeItem) {
    const child = this.getChildren()
      .find(child => child.getTreeItem() === treeItem);
    this.removeChild(child);
  }

}

export default Items;