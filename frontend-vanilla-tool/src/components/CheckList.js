import { RIGHT, ITEM_LAYOUT } from '../tools/Constants.js';
import Item from './Item.js';
import CheckListView from './views/CheckListView.js';
import AddItemButton from './AddItemButton.js';
import Items from './Items.js';
import Tree from './decorators/Tree.js';
import DragDropDecorator from './decorators/DragDropDecorator.js';

class CheckList extends Items {

  name = 'CheckList';

  #item;

  constructor(treeItem) {
    super(new CheckListView(), treeItem, ITEM_LAYOUT.Todo);

    const rights = [RIGHT.update];
    this.#item = new Item({ treeItem, layout: ITEM_LAYOUT.Todo, rights });
    this.setStaticChild('title', new DragDropDecorator(this.#item));

    const addButton = new AddItemButton({ id: 'addNewItem', label: 'Ajouter un élément', layout: ITEM_LAYOUT.Todo });
    addButton.setDoActionCallback(this.addNewItem.bind(this, 'Saisir un pense-bête'));
    this.setStaticChild('addItemAction', addButton);
  }

  /**
   * Positionne les données à afficher
   * @param {TreeItem} treeItem - Informations sur la tache
   */
  setTreeItem(treeItem) {
    this.#item.setTreeItem(treeItem);
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

  giveFocus() {
    this.#item.giveFocus();
  }

}

export default CheckList;