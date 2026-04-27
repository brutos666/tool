import { RIGHT, ITEM_LAYOUT } from '../tools/Constants.js';
import Item from './Item.js';
import TreeList from './TreeList.js';
import CheckListView from './views/CheckListView.js';
import AddItemButton from './AddItemButton.js';

class CheckList extends TreeList {

  name = 'CheckList';

  #item;

  constructor(treeItem) {
    super(new CheckListView(), treeItem, ITEM_LAYOUT.Todo);

    const rights = [RIGHT.update];
    this.#item = new Item({ treeItem, layout: ITEM_LAYOUT.Todo, rights });
    this.setStaticChild('title', this.#item);

    const addButton = new AddItemButton({ id: 'addNewItem', label: 'Ajouter un élément', layout: ITEM_LAYOUT.Todo });
    addButton.setDoActionCallback(this.addNewItem.bind(this, 'Nouveau todo'));
    this.setStaticChild('addItemAction', addButton);
  }

  /**
   * Positionne les données à afficher
   * @param {TreeItem} treeItem - Informations sur la tache
   */
  setTreeItem(treeItem) {
    this.#item.updateData({ treeItem, layout: ITEM_LAYOUT.Todo, rights: [RIGHT.update] });
    super.setTreeItem(treeItem);
  }

  addItemView(itemComponent) {
    super.addItemView(itemComponent);
    itemComponent.setRoot();
    itemComponent.setOpen(true);
  }

}

export default CheckList;