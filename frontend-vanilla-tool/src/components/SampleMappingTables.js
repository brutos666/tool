import { ITEM_LAYOUT } from '../tools/Constants.js';
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

    const rights = ITEM_LAYOUT.getRights(ITEM_LAYOUT.Story);
    this.#item = new Item({ treeItem, layout: ITEM_LAYOUT.Story, rights });
    this.#commandItem = new CommandItemDecorator(this.#item, { treeItem, rights });
    this.setStaticChild('storyItem', this.#commandItem);

    const buttonAddRule = new ActionButton({ id: 'addRule', label: 'Ajouter une règle' });
    buttonAddRule.setDoActionCallback(this.addNewItem.bind(this, 'Nouvelle règle'));
    this.setStaticChild('addItemAction', buttonAddRule);
  }
  setTreeItem(treeItem) {
    const rights = ITEM_LAYOUT.getRights(ITEM_LAYOUT.Story);
    this.#item.updateData({ treeItem, layout: ITEM_LAYOUT.Story, rights });
    this.#commandItem.setTreeItem(treeItem);
    super.setTreeItem(treeItem);
  }

  /**
   * @override
   * @param {TreeItem} treeItem - Informations sur la tache
   * @returns {Component} composant
   */
  getItemComponent(treeItem) {
    const rights = ITEM_LAYOUT.getRights(ITEM_LAYOUT.Rules);
    const item = new Item({ treeItem, layout: ITEM_LAYOUT.Rules, rights });
    const commandItem = new CommandItemDecorator(item, { treeItem, rights });
    const sampleItems = new SampleMappingSamples(treeItem);
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