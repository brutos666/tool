import NavTree from './NavTree.js';
import WorkingSpaceView from './views/WorkingSpaceView.js';
import Tree from './decorators/Tree.js';
import Component from './Component.js';
import MainSpace from './MainSpace.js';
import Menu from './Menu.js';
import ActionButton from './ActionButton.js';
import CommandActionDecorator from './decorators/CommandActionDecorator.js';
import FileUpload from './FileUpload.js';
import CommandLoadDecorator from './decorators/CommandLoadDecorator.js';
import CommandSaveDecorator from './decorators/CommandSaveDecorator.js';
import StoreData from '../data/StoreData.js';

class WorkingSpace extends Component {

  constructor() {
    super(new WorkingSpaceView());

    const menu = new Menu();
    const navTree = new NavTree();
    const mainSpace = new MainSpace();

    const loadNavTree = new CommandLoadDecorator(navTree);
    const reloadAction = new ActionButton({ id: 'reload', label: 'Actualiser' });
    reloadAction.setDoActionCallback(loadNavTree.loadItems.bind(loadNavTree));
    const saveNavTree = new CommandSaveDecorator(loadNavTree, { treeItem: StoreData.getTreeItem() });
    const saveAllAction = new ActionButton({ id: 'save', label: 'Sauvegarder tout' });
    saveAllAction.setDoActionCallback(saveNavTree.doSave.bind(saveNavTree));
    const saveMainSpace = new CommandSaveDecorator(mainSpace, { treeItem: StoreData.getTreeItem() });
    const saveMainAction = new ActionButton({ id: 'saveCurrent', label: 'Sauvegarder la vue courante' });
    saveMainAction.setDoActionCallback(saveMainSpace.doSave.bind(saveMainSpace));
    const exportAction = new ActionButton({ id: 'export', label: 'Exporter tout' });
    const exportActionWithCommands = new CommandActionDecorator(exportAction);
    exportAction.setDoActionCallback(exportActionWithCommands.exportItems.bind(exportActionWithCommands));
    const importAction = new FileUpload({ id: 'import', label: 'Importer' });
    const importActionWithCommands = new CommandActionDecorator(importAction);
    importAction.setDoActionCallback(importActionWithCommands.importItems.bind(importActionWithCommands));

    menu.addChild(reloadAction);
    menu.addChild(saveAllAction);
    menu.addChild(saveMainAction);
    menu.addChild(exportAction);
    menu.addChild(importActionWithCommands);

    this.setStaticChild('menu', menu);
    this.setStaticChild('nav', saveNavTree);
    this.setStaticChild('main', saveMainSpace);

    navTree.getView()
      .addEventListener(Tree.EVENTS.focus, event => {
        mainSpace.setTreeItem(event.detail);
        saveMainSpace.setTreeItem(event.detail);
      });

    loadNavTree.loadItems();
  }

}

export default WorkingSpace;