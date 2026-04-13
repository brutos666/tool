import { ITEM_LAYOUT, RIGHT } from '../tools/Constants.js';
import CommandItemDecorator from './decorators/CommandItemDecorator.js';
import Item from './Item.js';
import Items from './Items.js';
import SampleMappingTablesView from './views/SampleMappingTablesView.js';
import SampleMappingSamples from './SampleMappingSamples.js';
import ActionButton from './ActionButton.js';
/** @import TreeItem from '../data/TreeItem.js'; */

class SampleMappingTables extends Items {

  name = 'SampleMappingTables';

  #item;
  #commandItem;

  constructor(treeItem) {
    super(new SampleMappingTablesView(), treeItem, ITEM_LAYOUT.Rules);

    this.#item = new Item({ treeItem, layout: ITEM_LAYOUT.Story, rights: [] });
    this.#commandItem = new CommandItemDecorator(this.#item, { treeItem, rights: [RIGHT.update] });
    this.setStaticChild('storyItem', this.#commandItem);

    const buttonAddRule = new ActionButton({ label: 'Add Rule' });
    buttonAddRule.setDoActionCallback(this.addNewItem.bind(this, 'Nouvelle règle'));
    this.setStaticChild('addRule', buttonAddRule);
  }
  setTreeItem(treeItem) {
    this.#item.updateData({ treeItem, layout: ITEM_LAYOUT.Story, rights: [RIGHT.update] });
    this.#commandItem.setTreeItem(treeItem);
    super.setTreeItem(treeItem);
  }

  /**
   * @override
   * @param {TreeItem} treeItem - Informations sur la tache
   * @returns {Component} composant
   */
  getItemComponent(treeItem) {
    const item = new Item({ treeItem, layout: ITEM_LAYOUT.Rules, rights: [RIGHT.update] });
    const commandItem = new CommandItemDecorator(item, { treeItem, rights: [RIGHT.update] });
    const sampleItems = new SampleMappingSamples(treeItem, ITEM_LAYOUT.Sample);
    return { commandItem, sampleItems };
  }

  addItemView(data) {
    /** @type {SampleMappingTablesView} */
    const tableView = this.getView();
    tableView.addColumn(data.commandItem.getView(), data.sampleItems.getView());
  }
  removeAllItems() {
    /** @type {SampleMappingTablesView} */
    const tableView = this.getView();
    tableView.removeAllColumns();
  }

  removeItem(index) {
    /** @type {SampleMappingTablesView} */
    const tableView = this.getView();
    tableView.removeColumn(index);
  }

}

export default SampleMappingTables;