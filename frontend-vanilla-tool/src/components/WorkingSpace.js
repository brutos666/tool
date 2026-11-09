import StoreData from '../data/StoreData.js';
import ActionButton from './ActionButton.js';
import Component from './Component.js';
import ButtonDialog from './decorators/ButtonDialog.js';
import CommandItemsDecorator from './decorators/CommandItemsDecorator.js';
import FileUpload from './FileUpload.js';
import MainSpace from './MainSpace.js';
import Menu from './Menu.js';
import NavSpace from './NavSpace.js';
import WorkingSpaceView from './views/WorkingSpaceView.js';

class WorkingSpace extends Component {

  #currentTreeItem;
  #menu;
  #decorateMainSpace;
  #decorateNavSpace;

  constructor() {
    super(new WorkingSpaceView());

    this.#currentTreeItem = StoreData.getTreeItem();
    this.#menu = new Menu();
    const navSpace = new NavSpace();
    this.#decorateNavSpace = new CommandItemsDecorator(navSpace, { treeItem: this.#currentTreeItem });
    this.#decorateMainSpace = new CommandItemsDecorator(new MainSpace(), { treeItem: this.#currentTreeItem });

    const reloadAction = new ActionButton({ id: 'reload', label: 'Actualiser', role: 'menuitem', type: 'menu' });
    reloadAction.setDoActionCallback(this.#decorateNavSpace.loadItems.bind(this.#decorateNavSpace));
    const saveAllAction = new ActionButton({ id: 'save', label: 'Sauvegarder tout', role: 'menuitem', type: 'menu' });
    saveAllAction.setDoActionCallback(this.#decorateNavSpace.doSave.bind(this.#decorateNavSpace));

    const saveMainAction = new ActionButton({ id: 'saveCurrent', label: 'Sauvegarder la vue courante', role: 'menuitem', type: 'menu' });
    saveMainAction.setDoActionCallback(this.#decorateMainSpace.doSave.bind(this.#decorateMainSpace));
    const exportAction = new ActionButton({ id: 'export', label: 'Exporter tout', role: 'menuitem', type: 'menu' });
    exportAction.setDoActionCallback(this.#decorateNavSpace.exportItems.bind(this.#decorateNavSpace));
    const importFile = new FileUpload({ id: 'import', label: 'Importer' });
    const importAction = new ButtonDialog(importFile, { id: 'import', label: 'Importer', role: 'menuitem', type: 'menu' });
    importFile.setDoActionCallback(this.importItems.bind(this, importAction));

    this.#menu.addChild(reloadAction);
    this.#menu.addChild(saveAllAction);
    this.#menu.addChild(saveMainAction);
    this.#menu.addChild(exportAction);
    this.#menu.addChild(importAction);

    this.setStaticChild('menu', this.#menu);
    this.setStaticChild('nav', this.#decorateNavSpace);
    this.setStaticChild('main', this.#decorateMainSpace);

    this.#decorateNavSpace.loadItems()
      .then(() => navSpace.giveFocus());
  }

  setCurrentTreeItem(treeItem) {
    if (this.#currentTreeItem === treeItem) {
      return;
    }
    this.#currentTreeItem = treeItem;
    if (treeItem) {
      this.#decorateMainSpace.getDecoratedElement()
        .setTreeItem(treeItem);
      this.#decorateMainSpace.setTreeItem(treeItem);
    }
  }

  importItems(importAction, file) {
    this.#decorateNavSpace.importItems(file)
      .then(() => importAction.closeDialog());
  }

}

export default WorkingSpace;