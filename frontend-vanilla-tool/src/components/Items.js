import { ITEM_LAYOUT, RIGHT } from '../tools/Constants.js';
import Component from './Component.js';
import CommandItemDecorator from './decorators/CommandItemDecorator.js';
import Item from './Item.js';
import ItemsView from './views/ItemsView.js';
/** @import TreeItem from '../data/TreeItem.js'; */

class Items extends Component {

  /** @type {ITEM_LAYOUT} */
  #itemLayout;
  /** @type {TreeItem} */
  #treeItem;
  /** @type {Array<Component>} */
  #itemsComponent = [];
  /** @type {Array<TreeItem>} */
  #treeItemArray = [];

  /**
   * @constructor
   * @param {ItemsView} view
   * @param {TreeItem} treeItem
   * @param {ITEM_LAYOUT} itemLayout
   */
  constructor(view, treeItem, itemLayout) {
    super(view === undefined ? new ItemsView() : view);
    this.#treeItem = treeItem;
    this.#itemLayout = itemLayout;
    const treeItemList = treeItem.getTreeItemList();
    this.addItems(treeItemList.getTreeList());
    treeItemList.addObserver(this);
  }
  getLayout() {
    return this.#itemLayout;
  }
  getTreeItemList() {
    return this.#treeItem.getTreeItemList();
  }
  addNewItem(title) {
    this.#treeItem.addItem({ title, state: 'TODO', children: [] });
  }
  doDelete(treeItemToRemove) {
    this.#treeItem.removeItem(treeItemToRemove);
  }
  getItemsComponent() {
    return this.#itemsComponent;
  }

  destroy() {
    this.#treeItem.getTreeItemList()
      .removeObserver(this);
  }

  setTreeItem(treeItem) {
    this.#treeItem.getTreeItemList()
      .removeObserver(this);
    this.#treeItem = treeItem;
    const treeItemList = treeItem.getTreeItemList();
    treeItemList.addObserver(this);
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
      const itemComponent = this.getItemComponent(treeItem);
      this.addItemView(itemComponent);
      this.#treeItemArray.push(treeItem);
      this.#itemsComponent.push(itemComponent);
    });
  }

  /**
   * Suppression d'un ou plusieurs items
   * @param {Array<TreeItem>} treeItemArray
   */
  removeItems(treeItemArray) {
    treeItemArray.forEach(treeItem => {
      const index = this.#treeItemArray.indexOf(treeItem);
      this.removeItem(index);
      this.#treeItemArray.splice(index, 1);
      this.#itemsComponent.splice(index, 1);
    });
  }

  removeAllItems() {
    this.removeAllItemsViews();
    this.#itemsComponent = [];
    this.#treeItemArray = [];
  }

  /**
   *******************************************************************
   * Ces méthodes sont à réécrire dans la classe dérivée si nécessaire
   *******************************************************************
   */

  /**
   * Convertir un item en composant
   * @param {TreeItem} treeItem - Informations sur la tache
   * @returns {Object} objet permettant l'ajout d'un item dans le vue
   */
  getItemComponent(treeItem) {
    const layout = this.getLayout();
    const rights = ITEM_LAYOUT.getRights(layout);
    const item = new Item({ treeItem, layout, rights });
    item.setParentContainer(this);
    // Mise en place du décorateur permettant la validation en base de données
    return new CommandItemDecorator(item, { treeItem, rights });
  }

  /**
   * Ajout d'un item
   * @param {Object} itemComponent - objet permettant l'ajout d'un item dans le vue
   */
  addItemView(itemComponent) {
    /** @type {ItemsView} */
    const view = this.getView();
    view.addItemView(itemComponent.getView());
  }
  removeAllItemsViews() {
    /** @type {ItemsView} */
    const view = this.getView();
    view.removeAllItemsViews();
  }
  removeItem(index) {
    /** @type {ItemsView} */
    const view = this.getView();
    view.removeItemView(index);
  }

  getLayoutRights() {
    const layout = this.getLayout();
    if (ITEM_LAYOUT.isPostIt(layout)) {
      if (layout === ITEM_LAYOUT.Story) {
        return [RIGHT.update];
      }
      return [ RIGHT.update, RIGHT.delete ];
    }
    return [ RIGHT.create, RIGHT.update, RIGHT.delete ];
  }

}

export default Items;