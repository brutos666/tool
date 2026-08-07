import { ITEM_LAYOUT, RIGHT } from '../tools/Constants.js';
import AddItemButton from './AddItemButton.js';
import Item from './Item.js';
import Items from './Items.js';
import TreeFocusManager from './TreeFocusManager.js';
import DragDropDecorator from './decorators/DragDropDecorator.js';
import Tree from './decorators/Tree.js';
import CheckListView from './views/CheckListView.js';

class CheckList extends Items {

  name = 'CheckList';

  #decoratedTitleItem;

  constructor(treeItem) {
    super(new CheckListView(), treeItem, ITEM_LAYOUT.Todo);

    const rights = [RIGHT.update];
    this.#decoratedTitleItem = new DragDropDecorator(new Item({ treeItem, layout: ITEM_LAYOUT.Todo, rights }));
    this.setStaticChild('title', this.#decoratedTitleItem);

    const addButton = new AddItemButton({ id: 'addNewItem', label: 'Ajouter un élément', layout: ITEM_LAYOUT.Todo });
    addButton.setDoActionCallback(this.addNewItem.bind(this, 'Saisir un pense-bête'));
    this.setStaticChild('addItemAction', addButton);
  }

  /** @override */
  initFocusManager() {
    super.setFocusManager(new TreeFocusManager(this.getElementView(), 'horizontal', false));
  }

  /**
   * Positionne les données à afficher
   * @param {TreeItem} treeItem - Informations sur la tache
   */
  setTreeItem(treeItem) {
    this.#decoratedTitleItem.setTreeItem(treeItem);
    super.setTreeItem(treeItem);
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
    const itemComponent = new Tree(item, { treeItem, layout, rights });
    itemComponent.setRoot();
    itemComponent.setOpen(true);
    return new DragDropDecorator(itemComponent);
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

  /** @override */
  added(parent) {
    super.added(parent);

    this.getStaticChild('title')
      .getDecoratedElementByName('Item')
      .setTabIndex(0);

    super.getFocusManager()
      .enableKeyNavigation();
  }

}

export default CheckList;