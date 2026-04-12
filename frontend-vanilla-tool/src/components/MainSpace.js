import Component from './Component.js';
import Toolbar from './Toolbar.js';
import Select from './Select.js';
import MainSpaceView from './views/MainSpaceView.js';
import { LAYOUT } from '../tools/Constants.js';
import CheckList from './CheckList.js';
import ActionButton from './ActionButton.js';
import SampleMapping from './SampleMapping.js';
/** @import DisplayItemsSpace from './DisplayItemsSpace.js'; */

class MainSpace extends Component {

  #treeItem;

  /** @type {DisplayItemsSpace} */
  #main;

  constructor() {
    super(new MainSpaceView());
    const select = new Select({ id: 'select', options: LAYOUT.getOptions() });
    select.setDoSelectCallback(this.changeDisplay.bind(this));
    const addItemAction = new ActionButton({ id: 'addItem', label: '< Ajouter un élément >' });
    addItemAction.setDoActionCallback(this.addNewItem.bind(this));
    const toolbar = new Toolbar();
    toolbar.addChild(select);
    toolbar.addChild(addItemAction);
    this.setStaticChild('toolbar', toolbar);
  }

  setTreeItem(treeItem) {
    this.#treeItem = treeItem;
    if (this.#main) {
      this.#main.setTreeItem(this.#treeItem);
    }
  }

  changeDisplay(value) {
    switch (value) {
      case LAYOUT.SampleMapping:
        this.#main = new SampleMapping();
        break;
      case LAYOUT.CheckList:
        this.#main = new CheckList();
        break;
    }
    this.setStaticChild('main', this.#main);
    if (this.#treeItem) {
      this.#main.setTreeItem(this.#treeItem);
    }
  }

  addNewItem() {
    if (this.#treeItem && this.#main) {
      this.#main.addNewItem();
    }
  }

}

export default MainSpace;