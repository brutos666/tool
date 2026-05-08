import WorkingSpaceView from './views/WorkingSpaceView.js';
import Component from './Component.js';
import MainSpace from './MainSpace.js';
import Menu from './Menu.js';
import ActionButton from './ActionButton.js';
import FileUpload from './FileUpload.js';
import StoreData from '../data/StoreData.js';
import CommandDecorator from './decorators/CommandDecorator.js';
import ButtonDialog from './decorators/ButtonDialog.js';
import Item from './Item.js';
import NavSpace from './NavSpace.js';

class WorkingSpace extends Component {

  #currentTreeItem;

  constructor() {
    super(new WorkingSpaceView());

    this.#currentTreeItem = StoreData.getTreeItem();
    const menu = new Menu();
    const decorateNavSpace = new CommandDecorator(new NavSpace(), { treeItem: this.#currentTreeItem });
    const decorateMainSpace = new CommandDecorator(new MainSpace(), { treeItem: this.#currentTreeItem });

    const reloadAction = new ActionButton({ id: 'reload', label: 'Actualiser', role: 'menuitem', type: 'menu' });
    reloadAction.setDoActionCallback(decorateNavSpace.loadItems.bind(decorateNavSpace));
    const saveAllAction = new ActionButton({ id: 'save', label: 'Sauvegarder tout', role: 'menuitem', type: 'menu' });
    saveAllAction.setDoActionCallback(decorateNavSpace.doSave.bind(decorateNavSpace));

    const saveMainAction = new ActionButton({ id: 'saveCurrent', label: 'Sauvegarder la vue courante', role: 'menuitem', type: 'menu' });
    saveMainAction.setDoActionCallback(decorateMainSpace.doSave.bind(decorateMainSpace));
    const exportAction = new ActionButton({ id: 'export', label: 'Exporter tout', role: 'menuitem', type: 'menu' });
    exportAction.setDoActionCallback(decorateNavSpace.exportItems.bind(decorateNavSpace));
    const importFile = new FileUpload({ id: 'import', label: 'Importer' });
    importFile.setDoActionCallback(decorateNavSpace.importItems.bind(decorateNavSpace));
    const importAction = new ButtonDialog(importFile, { id: 'import', label: 'Importer', role: 'menuitem', type: 'menu' });

    menu.addChild(reloadAction);
    menu.addChild(saveAllAction);
    menu.addChild(saveMainAction);
    menu.addChild(exportAction);
    menu.addChild(importAction);

    this.setStaticChild('menu', menu);
    this.setStaticChild('nav', decorateNavSpace);
    this.setStaticChild('main', decorateMainSpace);

    decorateNavSpace.getView()
      .addEventListener(Item.EVENTS.current, event => {
        const treeItem = event.detail.getTreeItem();
        if (this.#currentTreeItem === treeItem) {
          return;
        }
        this.#currentTreeItem = treeItem;
        decorateMainSpace.getDecoratedElement()
          .setTreeItem(treeItem);
        decorateMainSpace.setTreeItem(treeItem);
      });

    decorateNavSpace.loadItems();
  }

}

export default WorkingSpace;