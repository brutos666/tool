import StoreData from '../data/StoreData.js';
import { ITEM_LAYOUT } from '../tools/Constants.js';
import AddItemButton from './AddItemButton.js';
import Component from './Component.js';
import TreeList from './TreeList.js';
import NavSpaceView from './views/NavSpaceView.js';

class NavSpace extends Component {

  name = 'NavSpace';
  constructor() {
    super(new NavSpaceView());

    const items = new TreeList(true, StoreData.getTreeItem(), ITEM_LAYOUT.Title);
    const addButton = new AddItemButton({ id: 'addNewItem', label: 'Ajouter un espace', layout: ITEM_LAYOUT.Title });
    addButton.setDoActionCallback(items.addNewItem.bind(items, 'Saisir un espace'));
    items.setStaticChild('addItemAction', addButton);

    this.setStaticChild('treeItems', items);
  }

}

export default NavSpace;