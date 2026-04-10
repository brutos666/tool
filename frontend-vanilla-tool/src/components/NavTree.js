import StoreData from '../data/StoreData.js';
import { VIEW_CHOICE } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import Component from './Component.js';
import AddTreeDecorator from './decorators/AddTreeDecorator.js';
import CommandLoadDecorator from './decorators/CommandLoadDecorator.js';
import Toolbar from './Toolbar.js';
import TreeList from './TreeList.js';
import NavTreeView from './views/NavTreeView.js';
/** @import Item from './Item.js' */

class NavTree extends Component {

  name = 'NavTree';

  constructor() {
    super(new NavTreeView());

    const items = new TreeList(StoreData.getTreeItem()
      .getTreeItemList(), VIEW_CHOICE.Tree);
    const itemsWithAddButton = new AddTreeDecorator(items, { label: '< Ajouter un espace >', treeItem: StoreData.getTreeItem() });
    const itemsWithCommands = new CommandLoadDecorator(itemsWithAddButton);
    this.setStaticChild('treeItems', itemsWithCommands);

    const reloadAction = new ActionButton({ id: 'reload', label: 'Rafraîchir' });
    reloadAction.setDoActionCallback(itemsWithCommands.loadItems.bind(itemsWithCommands));
    const toolbar = new Toolbar();
    toolbar.addChild(reloadAction);
    this.setStaticChild('toolbar', toolbar);

    itemsWithCommands.loadItems();
  }

  /**
   * @override
   * @returns {NavTreeView}
   */
  getView() {
    return super.getView();
  }

  addNewSpace() {
    StoreData.addRootItem({ id: undefined, title: 'Nouvel espace', text: '', state: 'TODO', parentId: -1, nextId: undefined, children: [] });
  }

}

export default NavTree;