import { ITEM_LAYOUT, RIGHT } from '../tools/Constants.js';
import CommandItemDecorator from './decorators/CommandItemDecorator.js';
import Item from './Item.js';
import Items from './Items.js';
import SampleMappingTablesView from './views/SampleMappingTablesView.js';
import SampleMappingSamples from './SampleMappingSamples.js';
/** @import TreeItem from '../data/TreeItem.js'; */

class SampleMappingTables extends Items {

  name = 'SampleMappingTables';

  #item;
  #commandItem;
  /** @type {Array<TreeItem>} */
  #rulesTreeItem = [];

  constructor(treeItem, itemLayout) {
    super(new SampleMappingTablesView(), treeItem.getTreeItemList(), itemLayout);

    this.#item = new Item({ treeItem, layout: ITEM_LAYOUT.Title, rights: [] });
    this.#commandItem = new CommandItemDecorator(this.#item, { treeItem, rights: [RIGHT.update] });
    this.setStaticChild('storyItem', this.#commandItem);
  }
  setTreeItem(treeItem) {
    this.#item.updateData({ treeItem, layout: ITEM_LAYOUT.Story, rights: [RIGHT.update] });
    this.#commandItem.setTreeItem(treeItem);
    this.setTreeItemList(treeItem.getTreeItemList());
  }

  addItem(treeItem) {
    const item = new Item({ treeItem, layout: ITEM_LAYOUT.Rules, rights: [RIGHT.update] });
    const commandItem = new CommandItemDecorator(item, { treeItem, rights: [RIGHT.update] });

    const sampleItems = new SampleMappingSamples(treeItem.getTreeItemList(), ITEM_LAYOUT.Sample);

    /** @type {SampleMappingTablesView} */
    const tableView = this.getView();
    tableView.addColumn(commandItem.getView(), sampleItems.getView());

    this.#rulesTreeItem.push(treeItem);
  }
  removeAllItems() {
    /** @type {SampleMappingTablesView} */
    const tableView = this.getView();
    tableView.removeAllColumns();
  }

  removeItem(treeItem) {
    const index = this.#rulesTreeItem
      .findIndex(ruleTreeItem => ruleTreeItem === treeItem);

    /** @type {SampleMappingTablesView} */
    const tableView = this.getView();
    tableView.removeColumn(index);
  }

}

export default SampleMappingTables;