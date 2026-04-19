import Component from './Component.js';
import Toolbar from './Toolbar.js';
import Select from './Select.js';
import MainSpaceView from './views/MainSpaceView.js';
import { LAYOUT } from '../tools/Constants.js';
import CheckList from './CheckList.js';
import SampleMappingTables from './SampleMappingTables.js';
import CommandDeleteDecorator from './decorators/CommandDeleteDecorator.js';
import CommandSaveDecorator from './decorators/CommandSaveDecorator.js';
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
    const select = new Select({ id: 'select', options: LAYOUT.getOptions() });
    select.setDoSelectCallback(this.changeDisplay.bind(this));
    const toolbar = new Toolbar();
    toolbar.addChild(select);
    this.setStaticChild('toolbar', toolbar);
  }

  async setTreeItem(treeItem) {
    if (this.#saveDecorator) {
      await this.#saveDecorator.doSave();
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
        this.#main = new SampleMappingTables(this.#treeItem);
        break;
      case LAYOUT.CheckList:
        this.#main = new CheckList(this.#treeItem);
        break;
      default:
        this.#main = null;
        break;
    }
    if (this.#main) {
      const mainWithDelete = new CommandDeleteDecorator(this.#main, { treeItem: this.#treeItem });
      this.#saveDecorator = new CommandSaveDecorator(mainWithDelete, { treeItem: this.#treeItem });
      this.setStaticChild('main', this.#saveDecorator);
    }
  }

}

export default MainSpace;