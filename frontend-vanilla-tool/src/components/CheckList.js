import { RIGHT, ITEM_LAYOUT } from '../tools/Constants.js';
import CommandItemDecorator from './decorators/CommandItemDecorator.js';
import Item from './Item.js';
import TreeList from './TreeList.js';
import CheckListView from './views/CheckListView.js';
import ActionButton from './ActionButton.js';

class CheckList extends TreeList {

  name = 'CheckList';

  #commandItem;
  #item;

  constructor(treeItem) {
    super(new CheckListView(), treeItem, ITEM_LAYOUT.Todo);

    this.#item = new Item({ treeItem, layout: ITEM_LAYOUT.Title, rights: [] });
    this.#commandItem = new CommandItemDecorator(this.#item, { treeItem, rights: [RIGHT.update] });
    this.setStaticChild('title', this.#commandItem);

    const addButton = new ActionButton({ id: 'addNewItem', label: '< Ajouter un élément >' });
    addButton.setDoActionCallback(this.addNewItem.bind(this, 'Nouveau todo'));
    this.setStaticChild('addItemAction', addButton);
  }

  /**
   * Positionne les données à afficher
   * @param {TreeItem} treeItem - Informations sur la tache
   */
  setTreeItem(treeItem) {
    this.#item.updateData({ treeItem, layout: ITEM_LAYOUT.Todo, rights: [RIGHT.update] });
    this.#commandItem.setTreeItem(treeItem);
    super.setTreeItem(treeItem);
  }

  addNewItem(title) {
    super.addNewItem(title);
    this.getLastTree()
      .setRoot();
  }

}

export default CheckList;