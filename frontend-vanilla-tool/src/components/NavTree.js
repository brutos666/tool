import StoreData from '../data/StoreData.js';
import { ITEM_LAYOUT } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import Component from './Component.js';
import CommandLoadDecorator from './decorators/CommandLoadDecorator.js';
import Toolbar from './Toolbar.js';
import TreeList from './TreeList.js';
import NavTreeView from './views/NavTreeView.js';
import TreeListView from './views/TreeListView.js';

class NavTree extends Component {

  name = 'NavTree';

  constructor() {
    super(new NavTreeView());

    const items = new TreeList(new TreeListView(), StoreData.getTreeItem(), ITEM_LAYOUT.Title);
    const addButton = new ActionButton({ id: 'addNewItem', label: '< Ajouter un espace >' });
    addButton.setDoActionCallback(items.addNewItem.bind(items, 'Nouvel espace'));
    items.setStaticChild('addItemAction', addButton);

    const itemsWithCommands = new CommandLoadDecorator(items);
    this.setStaticChild('treeItems', itemsWithCommands);

    const reloadAction = new ActionButton({ id: 'reload', label: 'Rafraîchir' });
    reloadAction.setDoActionCallback(itemsWithCommands.loadItems.bind(itemsWithCommands));
    const toolbar = new Toolbar();
    toolbar.addChild(reloadAction);
    this.setStaticChild('toolbar', toolbar);

    itemsWithCommands.loadItems();
  }

}

export default NavTree;