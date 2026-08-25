import StoreData from '../data/StoreData.js';
import ActionButton from './ActionButton.js';
import Component from './Component.js';
import ButtonDialog from './decorators/ButtonDialog.js';
import CommandItemsDecorator from './decorators/CommandItemsDecorator.js';
import FileUpload from './FileUpload.js';
import MainSpace from './MainSpace.js';
import Menu from './Menu.js';
import NavSpace from './NavSpace.js';
import NavTree from './NavTree.js';
import WorkingSpaceView from './views/WorkingSpaceView.js';

class WorkingSpace extends Component {

  #currentTreeItem;
  #menu;

  constructor() {
    super(new WorkingSpaceView());

    this.#currentTreeItem = StoreData.getTreeItem();
    this.#menu = new Menu();
    const navSpace = new NavSpace();
    const decorateNavSpace = new CommandItemsDecorator(navSpace, { treeItem: this.#currentTreeItem });
    const decorateMainSpace = new CommandItemsDecorator(new MainSpace(), { treeItem: this.#currentTreeItem });

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

    this.#menu.addChild(reloadAction);
    this.#menu.addChild(saveAllAction);
    this.#menu.addChild(saveMainAction);
    this.#menu.addChild(exportAction);
    this.#menu.addChild(importAction);

    this.setStaticChild('menu', this.#menu);
    this.setStaticChild('nav', decorateNavSpace);
    this.setStaticChild('main', decorateMainSpace);

    decorateNavSpace.getView()
      .addEventListener(NavTree.EVENTS.current, event => {
        const treeItem = event.detail;
        if (this.#currentTreeItem === treeItem) {
          return;
        }
        this.#currentTreeItem = treeItem;
        decorateMainSpace.getDecoratedElement()
          .setTreeItem(treeItem);
        decorateMainSpace.setTreeItem(treeItem);
      });

    decorateNavSpace.loadItems()
      .then(() => navSpace.giveFocus());
  }

}

export default WorkingSpace;