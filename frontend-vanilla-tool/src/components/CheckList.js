import TreeItemList from '../data/TreeItemList.js';
import { VIEW_CHOICE } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import Component from './Component.js';
import CommandItemsDecorator from './decorators/CommandItemsDecorator.js';
import Text from './Text.js';
import TreeList from './TreeList.js';
import CheckListView from './views/CheckListView.js';
/** @import TreeItem from '../data/TreeItem.js'; */

class CheckList extends Component {

  name = 'CheckList';

  #treeList;
  #treeItem;
  #text;

  constructor() {
    super(new CheckListView());

    this.#text = new Text({ text: 'Check List' });
    this.setStaticChild('name', this.#text);

    this.#treeList = new TreeList(new TreeItemList(), VIEW_CHOICE.TodoList);
    const itemsWithCommands = new CommandItemsDecorator(this.#treeList);
    this.setStaticChild('todoItems', itemsWithCommands);

    const loadItemsAction = new ActionButton({ id: 'addItem', label: '< Ajouter un todo >' });
    loadItemsAction.setDoActionCallback(this.addNewTodo.bind(this));
    this.setStaticChild('loadItems', loadItemsAction);
  }

  /**
   * Positionne les données à afficher
   * @param {TreeItem} treeItem - Informations sur la tache
   */
  setTreeItem(treeItem) {
    this.#treeItem = treeItem;
    this.#text.updateData({ text: treeItem.getItemInfos().title });
    this.#treeList.setTreeItemList(treeItem.getTreeItemList());
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