import TreeItemList from '../data/TreeItemList.js';
import TreeItem from '../data/TreeItem.js';
import { RIGHT, VIEW_CHOICE } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import Component from './Component.js';
import CommandItemDecorator from './decorators/CommandItemDecorator.js';
import Item from './Item.js';
import TreeList from './TreeList.js';
import CheckListView from './views/CheckListView.js';
import Toolbar from './Toolbar.js';

class CheckList extends Component {

  name = 'CheckList';

  #treeList;
  #treeItem;

  #item;

  constructor() {
    super(new CheckListView());
    const addItemAction = new ActionButton({ id: 'addItem', label: '< Ajouter un todo >' });
    addItemAction.setDoActionCallback(this.addNewTodo.bind(this));
    const toolbar = new Toolbar();
    toolbar.addChild(addItemAction);
    this.setStaticChild('toolbar', toolbar);

    this.#treeItem = new TreeItem({ title: 'Check List', children: [] });
    this.#item = new Item({ treeItem: this.#treeItem, layout: VIEW_CHOICE.TodoList, rights: [] });
    this.setStaticChild('header', new CommandItemDecorator(this.#item, { rights: [RIGHT.update] }));

    this.#treeList = new TreeList(new TreeItemList(), VIEW_CHOICE.TodoList);
    this.setStaticChild('todoItems', this.#treeList);
  }

  /**
   * Positionne les données à afficher
   * @param {TreeItem} treeItem - Informations sur la tache
   */
  setTreeItem(treeItem) {
    this.#treeItem = treeItem;
    this.#item.updateData({ treeItem, layout: VIEW_CHOICE.TodoList, rights: [RIGHT.update] });
    this.#treeList.setTreeItemList(treeItem.getTreeItemList());
  }

  clearTreeItem() {
    this.#treeItem = new TreeItem({ title: 'Check List', children: [] });
    this.#item.updateData({ treeItem: this.#treeItem, layout: VIEW_CHOICE.TodoList, rights: [] });
    this.#treeList.setTreeItemList(new TreeItemList());
  }

  addNewTodo() {
    if (this.#treeItem) {
      this.#treeItem.addItem({ title: 'Nouvelle tâche', state: 'TODO', children: [] });
      this.#treeList.getLastChild()
        .setRoot();
    }
  }

}

export default CheckList;