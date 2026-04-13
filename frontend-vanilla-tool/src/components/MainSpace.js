import Component from './Component.js';
import Toolbar from './Toolbar.js';
import Select from './Select.js';
import MainSpaceView from './views/MainSpaceView.js';
import { LAYOUT } from '../tools/Constants.js';
import CheckList from './CheckList.js';
import SampleMappingTables from './SampleMappingTables.js';
import TreeItem from '../data/TreeItem.js';
/** @import Items from './Items.js'; */

class MainSpace extends Component {

  #treeItem;
  /** @type {Items} */
  #main;

  constructor() {
    super(new MainSpaceView());
    const select = new Select({ id: 'select', options: LAYOUT.getOptions() });
    select.setDoSelectCallback(this.changeDisplay.bind(this));
    const toolbar = new Toolbar();
    toolbar.addChild(select);
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
        this.#main = new SampleMappingTables(this.#treeItem || new TreeItem({ title: 'Sample Mapping', children: [] }));
        break;
      case LAYOUT.CheckList:
        this.#main = new CheckList(this.#treeItem || new TreeItem({ title: 'Check List', children: [] }));
        break;
    }
    this.setStaticChild('main', this.#main);
  }

}

export default MainSpace;