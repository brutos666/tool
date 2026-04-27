import StoreData from '../data/StoreData.js';
import { ITEM_LAYOUT } from '../tools/Constants.js';
import AddItemButton from './AddItemButton.js';
import Component from './Component.js';
import TreeList from './TreeList.js';
import NavTreeView from './views/NavTreeView.js';
import TreeListView from './views/TreeListView.js';

class NavTree extends Component {

  name = 'NavTree';

  constructor() {
    super(new NavTreeView());

    const items = new TreeList(new TreeListView({ addButton: true }), StoreData.getTreeItem(), ITEM_LAYOUT.Title);
    const addButton = new AddItemButton({ id: 'addNewItem', label: 'Ajouter un espace', layout: ITEM_LAYOUT.Title });
    addButton.setDoActionCallback(items.addNewItem.bind(items, 'Nouvel espace'));
    items.setStaticChild('addItemAction', addButton);

    this.setStaticChild('treeItems', items);
  }

}

export default NavTree;