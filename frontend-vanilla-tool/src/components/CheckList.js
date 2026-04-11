import TreeItemList from '../data/TreeItemList.js';
import TreeItem from '../data/TreeItem.js';
import { RIGHT, ITEM_LAYOUT } from '../tools/Constants.js';
import CommandItemDecorator from './decorators/CommandItemDecorator.js';
import Item from './Item.js';
import TreeList from './TreeList.js';
import CheckListView from './views/CheckListView.js';
import DisplayItemsSpace from './DisplayItemsSpace.js';

class CheckList extends DisplayItemsSpace {

  name = 'CheckList';

  #treeList;
  #commandItem;

  #item;

  constructor() {
    super(new CheckListView());

    const treeItem = new TreeItem({ title: 'Check List', children: [] });
    this.#item = new Item({ treeItem, layout: ITEM_LAYOUT.Todo, rights: [] });
    this.#commandItem = new CommandItemDecorator(this.#item, { treeItem, rights: [RIGHT.update] });
    this.setStaticChild('header', this.#commandItem);

    this.#treeList = new TreeList(new TreeItemList(), ITEM_LAYOUT.Todo);
    this.setStaticChild('todoItems', this.#treeList);

    super.setTreeItem(treeItem);
  }

  /**
   * Positionne les données à afficher
   * @param {TreeItem} treeItem - Informations sur la tache
   */
  setTreeItem(treeItem) {
    super.setTreeItem(treeItem);
    this.#item.updateData({ treeItem, layout: ITEM_LAYOUT.Todo, rights: [RIGHT.update] });
    this.#commandItem.setTreeItem(treeItem);
    this.#treeList.setTreeItemList(treeItem.getTreeItemList());
  }

  addNewItem() {
    super.addNewItem();
    this.#treeList.getLastChild()
      .setRoot();
  }

}

export default CheckList;