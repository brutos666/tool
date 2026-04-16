import StoreData from '../data/StoreData.js';
import { ITEM_LAYOUT } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import Component from './Component.js';
import CommandActionDecorator from './decorators/CommandActionDecorator.js';
import CommandLoadDecorator from './decorators/CommandLoadDecorator.js';
import FileUpload from './FileUpload.js';
import Toolbar from './Toolbar.js';
import TreeList from './TreeList.js';
import NavTreeView from './views/NavTreeView.js';
import TreeListView from './views/TreeListView.js';
import CommandDeleteDecorator from './decorators/CommandDeleteDecorator.js';

class NavTree extends Component {

  name = 'NavTree';

  constructor() {
    super(new NavTreeView());

    const items = new TreeList(new TreeListView(), StoreData.getTreeItem(), ITEM_LAYOUT.Title);
    const addButton = new ActionButton({ id: 'addNewItem', label: 'Ajouter un espace' });
    addButton.setDoActionCallback(items.addNewItem.bind(items, 'Nouvel espace'));
    items.setStaticChild('addItemAction', addButton);

    const itemsWithDelete = new CommandDeleteDecorator(items, { treeItem: StoreData.getTreeItem() });
    const itemsWithCommands = new CommandLoadDecorator(itemsWithDelete);
    this.setStaticChild('treeItems', itemsWithCommands);

    const reloadAction = new ActionButton({ id: 'reload', label: 'Rafraîchir' });
    reloadAction.setDoActionCallback(itemsWithCommands.loadItems.bind(itemsWithCommands));
    const toolbar = new Toolbar();
    toolbar.addChild(reloadAction);

    const exportAction = new ActionButton({ id: 'export', label: 'Exporter' });
    const exportActionWithCommands = new CommandActionDecorator(exportAction);
    exportAction.setDoActionCallback(exportActionWithCommands.exportItems.bind(exportActionWithCommands));
    toolbar.addChild(exportAction);

    const importAction = new FileUpload({ id: 'import', label: 'Importer' });
    const importActionWithCommands = new CommandActionDecorator(importAction);
    importAction.setDoActionCallback(importActionWithCommands.importItems.bind(importActionWithCommands));
    toolbar.addChild(importActionWithCommands);

    this.setStaticChild('toolbar', toolbar);

    itemsWithCommands.loadItems();
  }

}

export default NavTree;