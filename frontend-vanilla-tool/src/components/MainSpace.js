import Component from './Component.js';
import Toolbar from './Toolbar.js';
import Select from './Select.js';
import MainSpaceView from './views/MainSpaceView.js';
import { LAYOUT } from '../tools/Constants.js';
import CheckList from './CheckList.js';
import ActionButton from './ActionButton.js';
import CommandDecorator from './decorators/CommandDecorator.js';
import ManagerItemsDecorator from './decorators/ManagerItemsDecorator.js';
import SampleMappingSpace from './SampleMappingSpace.js';
/** @import Items from './Items.js'; */

class MainSpace extends Component {

  #treeItem;
  /** @type {Items} */
  #main;
  #display = '';
  /** @type {CommandSaveDecorator} */
  #saveDecorator;

  constructor() {
    super(new MainSpaceView());
    const select = new Select({ id: 'select', options: LAYOUT.getOptions(), value: LAYOUT.SampleMapping });
    select.setDoSelectCallback(this.changeDisplay.bind(this));
    const saveAction = new ActionButton({ id: 'save', label: 'Sauvegarder les modifications', role: 'button', type: 'label' });
    saveAction.setDoActionCallback(this.doSave.bind(this));

    const toolbar = new Toolbar();
    toolbar.addChild(select);
    toolbar.addChild(saveAction);
    this.setStaticChild('toolbar', toolbar);
  }

  async setTreeItem(treeItem) {
    if (this.#saveDecorator) {
      this.#saveDecorator.setTreeItem(treeItem);
    }
    this.#treeItem = treeItem;
    if (this.#main) {
      this.#main.setTreeItem(this.#treeItem);
    } else {
      this.changeDisplay(this.#display);
    }
  }

  changeDisplay(value) {
    this.#display = value;
    if (!this.#treeItem) {
      return;
    }
    if (this.#main) {
      this.#main.destroy();
    }

    switch (value) {
      case LAYOUT.SampleMapping:
        this.#main = new SampleMappingSpace(this.#treeItem);
        break;
      case LAYOUT.CheckList:
        this.#main = new ManagerItemsDecorator(new CheckList(this.#treeItem));
        break;
      default:
        this.#main = null;
        break;
    }
    if (!this.#main) {
      return;
    }
    this.#saveDecorator = new CommandDecorator(this.#main, { treeItem: this.#treeItem });
    this.setStaticChild('main', this.#saveDecorator);
  }

  doSave() {
    if (this.#saveDecorator) {
      return this.#saveDecorator.doSave();
    }
  }

}

export default MainSpace;