import { ITEM_LAYOUT } from '../tools/Constants.js';
import Item from './Item.js';
import Items from './Items.js';
import SampleMappingSamples from './SampleMappingSamples.js';
import AddItemButton from './AddItemButton.js';
import SampleMappingView from './views/SampleMappingView.js';
import SampleMappingColumnDecorator from './decorators/SampleMappingColumnDecorator.js';
import DragDropDecorator from './decorators/DragDropDecorator.js';
import ListItemDecorator from './decorators/ListItemDecorator.js';
/** @import TreeItem from '../data/TreeItem.js'; */

class SampleMapping extends Items {

  name = 'SampleMapping';

  #item;

  constructor(treeItem) {
    super(new SampleMappingView(), treeItem, ITEM_LAYOUT.Rules);

    const rights = ITEM_LAYOUT.getRights(ITEM_LAYOUT.Story);
    this.#item = new DragDropDecorator(new ListItemDecorator(new Item({ treeItem, layout: ITEM_LAYOUT.Story, rights })));
    this.setStaticChild('storyItem', this.#item);

    const buttonAddRule = new AddItemButton({ id: 'addRule', label: 'Ajouter une règle', layout: ITEM_LAYOUT.Rules });
    buttonAddRule.setDoActionCallback(this.addNewItem.bind(this, 'Saisir une règle'));
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
    return new SampleMappingColumnDecorator(new DragDropDecorator(new ListItemDecorator(item)), sampleItems);
  }

  /**
   * @override
   * @param {SampleMappingColumnDecorator} component
   */
  addItemView(component) {
    /** @type {SampleMappingView} */
    const tableView = this.getView();
    tableView.addColumn(component.getRuleItem()
      .getView(), component.getSampleItems()
      .getView());
  }
  addItemViewAt(component, index) {
    /** @type {SampleMappingView} */
    const tableView = this.getView();
    tableView.addColumnAt(component.getRuleItem()
      .getView(), component.getSampleItems()
      .getView(), index);
  }
  removeAllItemsViews() {
    /** @type {SampleMappingView} */
    const tableView = this.getView();
    tableView.removeAllColumns();
  }

  removeItemView(index) {
    /** @type {SampleMappingView} */
    const tableView = this.getView();
    tableView.removeColumn(index);
  }
  zoomMinus() {
    /** @type {SampleMappingView} */
    const tableView = this.getView();
    tableView.zoomMinus();
  }
  zoomPlus() {
    /** @type {SampleMappingView} */
    const tableView = this.getView();
    tableView.zoomPlus();
  }
  zoomReset() {
    /** @type {SampleMappingView} */
    const tableView = this.getView();
    tableView.zoomReset();
  }

  magnifyFocused() {
    /** @type {SampleMappingView} */
    const tableView = this.getView();
    tableView.magnifyFocused();
  }

  giveFocus() {
    this.#item.giveFocus();
  }

}

export default SampleMapping;