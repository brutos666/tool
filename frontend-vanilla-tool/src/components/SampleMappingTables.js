import { ITEM_LAYOUT } from '../tools/Constants.js';
import Item from './Item.js';
import Items from './Items.js';
import SampleMappingSamples from './SampleMappingSamples.js';
import ActionButton from './ActionButton.js';
import Toolbar from './Toolbar.js';
import AddItemButton from './AddItemButton.js';
import SampleMappingTablesView from './views/SampleMappingTablesView.js';
import CheckBox from './CheckBox.js';
/** @import TreeItem from '../data/TreeItem.js'; */

class SampleMappingTables extends Items {

  name = 'SampleMappingTables';

  #item;

  constructor(treeItem) {
    super(new SampleMappingTablesView(), treeItem, ITEM_LAYOUT.Rules);

    const zoomMinus = new ActionButton({ id: 'zoomMinus', label: 'Zoom -', role: 'button', type: 'label' });
    zoomMinus.setDoActionCallback(this.zoomMinus.bind(this));
    const zoomPlus = new ActionButton({ id: 'zoomPlus', label: 'Zoom +', role: 'button', type: 'label' });
    zoomPlus.setDoActionCallback(this.zoomPlus.bind(this));
    const reset = new ActionButton({ id: 'zoomReset', label: 'Zoom initial', role: 'button', type: 'label' });
    reset.setDoActionCallback(this.zoomReset.bind(this));
    const magnify = new CheckBox({ id: 'magnify', label: 'Activer le zoom sur le post-it courant', role: 'switch', type: 'toggle' });
    magnify.setToggleCallback(this.magnifyFocused.bind(this));
    const toolbar = new Toolbar();
    toolbar.addChild(zoomMinus);
    toolbar.addChild(zoomPlus);
    toolbar.addChild(reset);
    toolbar.addChild(magnify);
    this.setStaticChild('toolbar', toolbar);

    const rights = ITEM_LAYOUT.getRights(ITEM_LAYOUT.Story);
    this.#item = new Item({ treeItem, layout: ITEM_LAYOUT.Story, rights });
    this.setStaticChild('storyItem', this.#item);

    const buttonAddRule = new AddItemButton({ id: 'addRule', label: 'Ajouter une règle', layout: ITEM_LAYOUT.Rules });
    buttonAddRule.setDoActionCallback(this.addNewItem.bind(this, 'Nouvelle règle'));
    this.setStaticChild('addItemAction', buttonAddRule);
  }
  setTreeItem(treeItem) {
    this.#item.setTreeItem(treeItem);
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
  zoomMinus() {
    /** @type {SampleMappingTablesView} */
    const tableView = this.getView();
    tableView.zoomMinus();
  }
  zoomPlus() {
    /** @type {SampleMappingTablesView} */
    const tableView = this.getView();
    tableView.zoomPlus();
  }
  zoomReset() {
    /** @type {SampleMappingTablesView} */
    const tableView = this.getView();
    tableView.zoomReset();
  }

  magnifyFocused() {
    /** @type {SampleMappingTablesView} */
    const tableView = this.getView();
    tableView.magnifyFocused();
  }

}

export default SampleMappingTables;