import { ITEM_LAYOUT } from '../tools/Constants.js';
import DragDropDecorator from './decorators/DragDropDecorator.js';
import Tree from './decorators/Tree.js';
import Item from './Item.js';
import Items from './Items.js';
import TreeFocusManager from './TreeFocusManager.js';
import TreeListView from './views/TreeListView.js';
/** @import TreeItem from '../data/TreeItem.js'; */

class TreeList extends Items {

  name = 'TreeList';

  /**
   *
   * @param {boolean} addButton
   * @param {TreeItem} treeItem
   * @param {ITEM_LAYOUT} itemLayout
   */
  constructor(addButton, treeItem, itemLayout) {
    super(new TreeListView({ addButton }), treeItem, itemLayout);
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
  addItemView(itemComponent) {
    super.addItemView(itemComponent);
    super.getFocusManager()
      .addFocusable(itemComponent.getDecoratedElementByName('Tree'));
  }

  /** @override */
  addItemViewAt(itemComponent, index) {
    super.addItemViewAt(itemComponent, index);
    super.getFocusManager()
      .addFocusable(itemComponent.getDecoratedElementByName('Tree'));
  }

  /** @override */
  removeItemView(index) {
    super.removeItemView(index);
    super.getFocusManager()
      .removeFocusable(index);
  }

  /** @override */
  removeAllItemsViews() {
    super.removeAllItemsViews();
    super.getFocusManager()
      .removeAllFocusable();
  }

}

export default TreeList;