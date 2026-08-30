import { ITEM_LAYOUT } from '../tools/Constants.js';
import DragDropDecorator from './decorators/DragDropDecorator.js';
import Tree from './decorators/Tree.js';
import Item from './Item.js';
import Items from './Items.js';
import TreeFocusManager from './TreeFocusManager.js';
/** @import TreeItem from '../data/TreeItem.js'; */

class TreeItems extends Items {

  name = 'TreeItems';
  /**
   *
   * @param {View} view
   * @param {TreeItem} treeItem
   * @param {ITEM_LAYOUT} itemLayout
   */
  constructor(view, treeItem, itemLayout) {
    super(view, treeItem, itemLayout);
  }

  /** @override */
  initFocusManager() {
    // NOTE : le système de focus est positionné mais l'écoute des touches de navigation ne doit pas être effective au départ. C'est le composant qui contient les racines des arbres qui doit piloter au départ
    super.setFocusManager(new TreeFocusManager(this.getElementView(), 'vertical', false));
  }

  /**
   * @override
   * @param {TreeItem} treeItem - Informations sur la tache
   * @returns {Component} composant
   */
  getItemComponent(treeItem) {
    const layout = this.getLayout();
    const rights = ITEM_LAYOUT.getRights(layout);
    const item = new Item({ treeItem, layout, rights });
    return new DragDropDecorator(new Tree(item, { treeItem, layout, rights }));
  }

  /** @override */
  addItemViewAt(itemComponent, index) {
    super.addItemViewAt(itemComponent, index);

    /** @type {TreeFocusManager} */
    const focusManager = super.getFocusManager();
    focusManager.addComponentAt(index, itemComponent.getDecoratedElementByName('Tree'));
  }

  /** @override */
  removeItemView(index) {
    // NOTE : avertir le focusManager avant la suppression effective pour donner le focus à un autre élément que si le focus était dans la vue supprimée
    /** @type {TreeFocusManager} */
    const focusManager = super.getFocusManager();
    focusManager.removeComponent(index);

    super.removeItemView(index);
  }

  /** @override */
  replaceAllItems(treeItemArray) {
    /** @type {TreeFocusManager} */
    const focusManager = super.getFocusManager();
    const hasFocus = focusManager.isCurrentHasFocused();

    super.replaceAllItems(treeItemArray);

    if (hasFocus) {
      focusManager.giveFocus();
    }
  }

  /** @override */
  removeAllItemsViews() {
    /** @type {TreeFocusManager} */
    const focusManager = super.getFocusManager();
    focusManager.removeAllComponents();

    super.removeAllItemsViews();
  }

}
export default TreeItems;