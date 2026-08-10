import StoreData from '../data/StoreData.js';
import { ITEM_LAYOUT } from '../tools/Constants.js';
import AddItemButton from './AddItemButton.js';
import Component from './Component.js';
import TreeList from './TreeList.js';
import NavTreeView from './views/NavTreeView.js';
/** @import TreeFocusManager from './TreeFocusManager.js'; */
/** @import Tree from './decorators/Tree.js'; */

class NavTree extends Component {

  name = 'NavTree';
  constructor() {
    super(new NavTreeView());

    const items = new TreeList(true, StoreData.getTreeItem(), ITEM_LAYOUT.Title);
    const addButton = new AddItemButton({ id: 'addNewItem', label: 'Ajouter un espace', layout: ITEM_LAYOUT.Title });
    addButton.setDoActionCallback(items.addNewItem.bind(items, 'Saisir un espace'));
    items.setStaticChild('addItemAction', addButton);
    this.setStaticChild('treeItems', items);

    /** @type {TreeFocusManager} */
    const treeFocusManager = items.getFocusManager();
    treeFocusManager.mustPilotCurrentTree();
  }

}

export default NavTree;