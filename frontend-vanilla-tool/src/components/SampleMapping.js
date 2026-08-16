import { ITEM_LAYOUT } from '../tools/Constants.js';
import AddItemButton from './AddItemButton.js';
import ColumnFocusManager from './ColumnFocusManager.js';
import DragDropDecorator from './decorators/DragDropDecorator.js';
import ListItemDecorator from './decorators/ListItemDecorator.js';
import SampleMappingColumnDecorator from './decorators/SampleMappingColumnDecorator.js';
import Item from './Item.js';
import Items from './Items.js';
import SampleMappingSamples from './SampleMappingSamples.js';
import SampleMappingView from './views/SampleMappingView.js';
/** @import TreeItem from '../data/TreeItem.js'; */

class SampleMapping extends Items {

  name = 'SampleMapping';

  #item;
  /** @type {AddItemButton} */
  #addRuleButton;

  constructor(treeItem) {
    super(new SampleMappingView(), treeItem, ITEM_LAYOUT.Rules);

    const rights = ITEM_LAYOUT.getRights(ITEM_LAYOUT.Story);
    this.#item = new DragDropDecorator(new ListItemDecorator(new Item({ treeItem, layout: ITEM_LAYOUT.Story, rights })));
    this.setStaticChild('storyItem', this.#item);

    this.#addRuleButton = new AddItemButton({ id: 'addRule', label: 'Ajouter une règle', layout: ITEM_LAYOUT.Rules });
    this.#addRuleButton.setDoActionCallback(this.addNewItem.bind(this, 'Saisir une règle'));
    this.setStaticChild('addItemAction', this.#addRuleButton);

    super.getFocusManager()
      .addColumn(this.#addRuleButton);
  }

  /** @override */
  initFocusManager() {
    super.setFocusManager(new ColumnFocusManager(this.getElementView()));
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

  /** @override */
  addChildAt(element, index) {
    super.addChildAt(element, index);

    const ruleItem = element.getRuleItem();
    const sampleItems = element.getSampleItems();
    ruleItem.added(this);
    sampleItems.added(this);
  }
  /** @override */
  removeChild(element) {
    super.removeChild(element);

    const ruleItem = element.getRuleItem();
    const sampleItems = element.getSampleItems();
    ruleItem.removed();
    sampleItems.removed();
  }

  /**
   * @override
   * @param {SampleMappingColumnDecorator} component
   * @param {number} index
   */
  addItemViewAt(component, index) {
    /** @type {SampleMappingView} */
    const tableView = this.getView();
    const ruleItem = component.getRuleItem();
    const sampleItems = component.getSampleItems();
    tableView.addColumnAt(ruleItem.getView(), sampleItems.getView(), index);

    super.getFocusManager()
      .addColumnAt(index, ruleItem.getDecoratedElementByName('ListItemDecorator'), sampleItems);
  }
  removeAllItemsViews() {
    super.getFocusManager()
      .removeAllColumns();
    super.getFocusManager()
      .addColumn(this.#addRuleButton);

    /** @type {SampleMappingView} */
    const tableView = this.getView();
    tableView.removeAllColumns();
  }

  removeItemView(index) {
    // NOTE : avertir le focusManager avant la suppression effective pour donner le focus à un autre élément que si le focus était dans la vue supprimée
    super.getFocusManager()
      .removeColumn(index);

    /** @type {SampleMappingView} */
    const tableView = this.getView();
    tableView.removeColumn(index);
  }

  /** @override */
  added(parent) {
    super.added(parent);

    this.getStaticChild('storyItem')
      .getDecoratedElementByName('Item')
      .setTabIndex(0);

    super.getFocusManager()
      .enableKeyNavigation();
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

}

export default SampleMapping;