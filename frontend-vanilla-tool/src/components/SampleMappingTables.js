import { ITEM_LAYOUT } from '../tools/Constants.js';
import Item from './Item.js';
import Items from './Items.js';
import SampleMappingTablesView from './views/SampleMappingTablesView.js';
import SampleMappingSamples from './SampleMappingSamples.js';
import ActionButton from './ActionButton.js';
/** @import TreeItem from '../data/TreeItem.js'; */

class SampleMappingTables extends Items {

  name = 'SampleMappingTables';

  #item;

  constructor(treeItem) {
    super(new SampleMappingTablesView(), treeItem, ITEM_LAYOUT.Rules);

    const rights = ITEM_LAYOUT.getRights(ITEM_LAYOUT.Story);
    this.#item = new Item({ treeItem, layout: ITEM_LAYOUT.Story, rights });
    this.setStaticChild('storyItem', this.#item);

    const buttonAddRule = new ActionButton({ id: 'addRule', label: 'Ajouter une règle', role: 'button' });
    buttonAddRule.setDoActionCallback(this.addNewItem.bind(this, 'Nouvelle règle'));
    this.setStaticChild('addItemAction', buttonAddRule);
  }
  setTreeItem(treeItem) {
    const rights = ITEM_LAYOUT.getRights(ITEM_LAYOUT.Story);
    this.#item.updateData({ treeItem, layout: ITEM_LAYOUT.Story, rights });
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
    const sampleItems = new SampleMappingSamples(treeItem);
    return { item, sampleItems };
  }
  removeItemComponent(component) {
    component.item.destroy();
    component.sampleItems.destroy();
  }

  addItemView(data) {
    /** @type {SampleMappingTablesView} */
    const tableView = this.getView();
    tableView.addColumn(data.item.getView(), data.sampleItems.getView());
  }
  removeAllItemsViews() {
    /** @type {SampleMappingTablesView} */
    const tableView = this.getView();
    tableView.removeAllColumns();
  }

  removeItemView(index) {
    /** @type {SampleMappingTablesView} */
    const tableView = this.getView();
    tableView.removeColumn(index);
  }

}

export default SampleMappingTables;