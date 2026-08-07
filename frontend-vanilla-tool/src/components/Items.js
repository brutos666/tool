import { ITEM_LAYOUT, RIGHT } from '../tools/Constants.js';
import Composite from './Composite.js';
import DragDropDecorator from './decorators/DragDropDecorator.js';
import FocusManagerDecorator from './decorators/FocusManagerDecorator.js';
import Item from './Item.js';
import ItemsView from './views/ItemsView.js';
/** @import TreeItem from '../data/TreeItem.js'; */

class Items extends Composite {

  name = 'Items';

  /** @type {ITEM_LAYOUT} */
  #itemLayout;
  /** @type {TreeItem} */
  #treeItem;

  /**
   * @constructor
   * @param {ItemsView} view
   * @param {TreeItem} treeItem
   * @param {ITEM_LAYOUT} itemLayout
   */
  constructor(view, treeItem, itemLayout) {
    super(view === undefined ? new ItemsView() : view);
    this.initFocusManager();

    this.#treeItem = treeItem;
    this.#itemLayout = itemLayout;
    const treeItemList = treeItem.getTreeItemList();
    this.addItems(treeItemList.getTreeList());
    treeItemList.addObserver(this);
  }
  initFocusManager() {}
  getLayout() {
    return this.#itemLayout;
  }
  getTreeItemList() {
    return this.#treeItem.getTreeItemList();
  }
  addNewItem(title) {
    this.#treeItem.addChildItem({ title, state: 'TODO', children: [] });
  }
  destroy() {
    this.#treeItem.getTreeItemList()
      .removeObserver(this);
    this.removeAllChildren();
    super.destroy();
  }

  /**
   * Positionne l'item parent
   * @param {TreeItem} treeItem : modèle de l'item parent
   */
  setTreeItem(treeItem) {
    this.#treeItem.getTreeItemList()
      .removeObserver(this);
    this.#treeItem = treeItem;
    const treeItemList = treeItem.getTreeItemList();
    treeItemList.addObserver(this);
    this.replaceAllItems(treeItemList.getTreeList());
  }

  /**
   * Modification du modèle
   * @param {'remove'|'add'|'replaceAll'} action
   * @param {Array<TreeItem>} treeItemArray
   * @param {number|undefined} index
   */
  update(action, treeItemArray, index) {
    if (action === 'replaceAll') {
      this.replaceAllItems(treeItemArray);
    } else if (action === 'add') {
      this.addItems(treeItemArray, index);
    } else if (action === 'remove') {
      this.removeItems(treeItemArray);
    }
  }

  /**
   * Replacement de tous les items
   * @param {Array<TreeItem>} treeItemArray
   */
  replaceAllItems(treeItemArray) {
    const currentItemId = this.getCurrentItem()
      ?.getTreeItem()
      .getItemId();
    this.removeAllItems();
    this.addItems(treeItemArray);
    if (currentItemId) {
      const newCurrentItem = this.findItemById(currentItemId);
      newCurrentItem?.setCurrent();
    }
  }
  /**
   * Ajout d'un ou plusieurs items
   * @param {Array<TreeItem>} treeItemArray
   * @param {number|undefined} index
   */
  addItems(treeItemArray, index) {
    treeItemArray.forEach(treeItem => {
      const itemComponent = this.getItemComponent(treeItem);
      if (index !== undefined) {
        this.addItemViewAt(itemComponent, index);
        this.addChildAt(new FocusManagerDecorator(itemComponent, this), index);
        return;
      }
      this.addItemView(itemComponent);
      this.addChild(new FocusManagerDecorator(itemComponent, this));
    });
  }

  /**
   * Suppression d'un ou plusieurs items
   * @param {Array<TreeItem>} treeItemArray
   */
  removeItems(treeItemArray) {
    treeItemArray.forEach(treeItem => {
      const index = this.#treeItem.getTreeItemList()
        .getTreeList()
        .indexOf(treeItem);
      this.removeItemView(index);
      this.removeChild(this.getChildren()[index]);
    });
  }

  removeAllItems() {
    this.removeAllItemsViews();
    this.removeAllChildren();
  }

  /**
   * Recherche l'item par rapport à son numéro d'identifiant
   * @param {number} itemId - Numéro d'identifiant
   * @returns {Component} composant
   */
  findItemById(itemId) {
    return this.getChildren()
      .find(child => {
        const item = child.isDecorator() ? child.getDecoratedElement() : child;
        return item.getTreeItem()
          .getItemId() === itemId;
      });
  }

  getCurrentItem() {
    return this.getChildren()
      .map(child => (child.isDecorator() ? child.getDecoratedElement() : child))
      .find(child => {
        const item = child.isDecorator() ? child.getDecoratedElement() : child;
        return item.isCurrent();
      });
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
    return new DragDropDecorator(new Item({ treeItem, layout, rights }));
  }

  /**
   * Ajout d'un item
   * @param {Component} itemComponent - composant ajouté
   */
  addItemView(itemComponent) {
    /** @type {ItemsView} */
    const view = this.getView();
    view.addItemView(itemComponent.getView());
  }
  addItemViewAt(itemComponent, index) {
    /** @type {ItemsView} */
    const view = this.getView();
    view.addItemViewAt(itemComponent.getView(), index);
  }
  removeAllItemsViews() {
    /** @type {ItemsView} */
    const view = this.getView();
    view.removeAllItemsViews();
  }
  removeItemView(index) {
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