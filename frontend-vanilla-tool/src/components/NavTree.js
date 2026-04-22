import StoreData from '../data/StoreData.js';
import { ITEM_LAYOUT } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import Component from './Component.js';
import CommandActionDecorator from './decorators/CommandActionDecorator.js';
import CommandLoadDecorator from './decorators/CommandLoadDecorator.js';
import CommandSaveDecorator from './decorators/CommandSaveDecorator.js';
import FileUpload from './FileUpload.js';
import Toolbar from './Toolbar.js';
import TreeList from './TreeList.js';
import NavTreeView from './views/NavTreeView.js';
import TreeListView from './views/TreeListView.js';

class NavTree extends Component {

  name = 'NavTree';

  constructor() {
    super(new NavTreeView());

    const items = new TreeList(new TreeListView(), StoreData.getTreeItem(), ITEM_LAYOUT.Title);
    const addButton = new ActionButton({ id: 'addNewItem', label: 'Ajouter un espace' });
    addButton.setDoActionCallback(items.addNewItem.bind(items, 'Nouvel espace'));
    items.setStaticChild('addItemAction', addButton);

    const itemsWithLoad = new CommandLoadDecorator(items);
    const itemsWithCommands = new CommandSaveDecorator(itemsWithLoad, { treeItem: StoreData.getTreeItem() });
    this.setStaticChild('treeItems', itemsWithCommands);

    const reloadAction = new ActionButton({ id: 'reload', label: 'Rafraîchir' });
    reloadAction.setDoActionCallback(itemsWithLoad.loadItems.bind(itemsWithLoad));
    const toolbar = new Toolbar();
    toolbar.addChild(reloadAction);

    const saveAction = new ActionButton({ id: 'save', label: 'Sauvegarder' });
    saveAction.setDoActionCallback(itemsWithCommands.doSave.bind(itemsWithCommands));
    toolbar.addChild(saveAction);

    const exportAction = new ActionButton({ id: 'export', label: 'Exporter' });
    const exportActionWithCommands = new CommandActionDecorator(exportAction);
    exportAction.setDoActionCallback(exportActionWithCommands.exportItems.bind(exportActionWithCommands));
    toolbar.addChild(exportAction);

    const importAction = new FileUpload({ id: 'import', label: 'Importer' });
    const importActionWithCommands = new CommandActionDecorator(importAction);
    importAction.setDoActionCallback(importActionWithCommands.importItems.bind(importActionWithCommands));
    toolbar.addChild(importActionWithCommands);

    this.setStaticChild('toolbar', toolbar);

    itemsWithLoad.loadItems();
  }

}

export default NavTree;