import NavTree from './NavTree.js';
import WorkingSpaceView from './views/WorkingSpaceView.js';
import Tree from './decorators/Tree.js';
import Component from './Component.js';
import MainSpace from './MainSpace.js';
import Menu from './Menu.js';
import ActionButton from './ActionButton.js';
import FileUpload from './FileUpload.js';
import StoreData from '../data/StoreData.js';
import CommandSpaceDecorator from './decorators/CommandSpaceDecorator.js';

class WorkingSpace extends Component {

  constructor() {
    super(new WorkingSpaceView());

    const treeItem = StoreData.getTreeItem();
    const menu = new Menu();
    const decorateNavTree = new CommandSpaceDecorator(new NavTree(), { treeItem });
    const decorateMainSpace = new CommandSpaceDecorator(new MainSpace(), { treeItem });

    const reloadAction = new ActionButton({ id: 'reload', label: 'Actualiser' });
    reloadAction.setDoActionCallback(decorateNavTree.loadItems.bind(decorateNavTree));
    const saveAllAction = new ActionButton({ id: 'save', label: 'Sauvegarder tout' });
    saveAllAction.setDoActionCallback(decorateNavTree.doSave.bind(decorateNavTree));

    const saveMainAction = new ActionButton({ id: 'saveCurrent', label: 'Sauvegarder la vue courante' });
    saveMainAction.setDoActionCallback(decorateMainSpace.doSave.bind(decorateMainSpace));
    const exportAction = new ActionButton({ id: 'export', label: 'Exporter tout' });
    exportAction.setDoActionCallback(decorateNavTree.exportItems.bind(decorateNavTree));
    const importAction = new FileUpload({ id: 'import', label: 'Importer' });
    importAction.setDoActionCallback(decorateNavTree.importItems.bind(decorateNavTree));

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