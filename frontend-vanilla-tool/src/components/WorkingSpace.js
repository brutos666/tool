import NavTree from './NavTree.js';
import WorkingSpaceView from './views/WorkingSpaceView.js';
import Tree from './decorators/Tree.js';
import Component from './Component.js';
import MainSpace from './MainSpace.js';
import Menu from './Menu.js';
import ActionButton from './ActionButton.js';
import FileUpload from './FileUpload.js';
import StoreData from '../data/StoreData.js';
import CommandDecorator from './decorators/CommandDecorator.js';
import ButtonDialog from './decorators/ButtonDialog.js';

class WorkingSpace extends Component {

  constructor() {
    super(new WorkingSpaceView());

    const treeItem = StoreData.getTreeItem();
    const menu = new Menu();
    const decorateNavTree = new CommandDecorator(new NavTree(), { treeItem });
    const decorateMainSpace = new CommandDecorator(new MainSpace(), { treeItem });

    const reloadAction = new ActionButton({ id: 'reload', label: 'Actualiser', role: 'menuitem' });
    reloadAction.setDoActionCallback(decorateNavTree.loadItems.bind(decorateNavTree));
    const saveAllAction = new ActionButton({ id: 'save', label: 'Sauvegarder tout', role: 'menuitem' });
    saveAllAction.setDoActionCallback(decorateNavTree.doSave.bind(decorateNavTree));

    const saveMainAction = new ActionButton({ id: 'saveCurrent', label: 'Sauvegarder la vue courante', role: 'menuitem' });
    saveMainAction.setDoActionCallback(decorateMainSpace.doSave.bind(decorateMainSpace));
    const exportAction = new ActionButton({ id: 'export', label: 'Exporter tout', role: 'menuitem' });
    exportAction.setDoActionCallback(decorateNavTree.exportItems.bind(decorateNavTree));
    const importFile = new FileUpload({ id: 'import', label: 'Importer', role: 'menuitem' });
    importFile.setDoActionCallback(decorateNavTree.importItems.bind(decorateNavTree));
    const importAction = new ButtonDialog(importFile, { id: 'import', label: 'Importer', role: 'menuitem' });

    menu.addChild(reloadAction);
    menu.addChild(saveAllAction);
    menu.addChild(saveMainAction);
    menu.addChild(exportAction);
    menu.addChild(importAction);

    this.setStaticChild('menu', menu);
    this.setStaticChild('nav', decorateNavTree);
    this.setStaticChild('main', decorateMainSpace);

    decorateNavTree.getView()
      .addEventListener(Tree.EVENTS.focus, event => {
        decorateMainSpace.getDecoratedElement()
          .setTreeItem(event.detail);
        decorateMainSpace.setTreeItem(event.detail);
      });

    decorateNavTree.loadItems();
  }

}

export default WorkingSpace;