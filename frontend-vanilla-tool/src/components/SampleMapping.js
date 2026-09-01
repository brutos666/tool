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
    const storyListItem = new ListItemDecorator(new Item({ treeItem, layout: ITEM_LAYOUT.Story, rights }));
    this.#item = new DragDropDecorator(storyListItem);
    this.setStaticChild('storyItem', this.#item);

    super.getFocusManager()
      .setHeader(storyListItem);

    this.#addRuleButton = new AddItemButton({ id: 'addRule', label: 'Ajouter une règle', layout: ITEM_LAYOUT.Rules });
    this.#addRuleButton.setDoActionCallback(this.addNewItem.bind(this, 'Saisir une règle'));
    this.setStaticChild('addItemAction', this.#addRuleButton);
  }

  /** @override */
  initFocusManager() {
    const focusManager = new ColumnFocusManager(this.getElementView());
    super.setFocusManager(focusManager);
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
   * @param {number} index
   */
  addItemViewAt(component, index) {
    /** @type {SampleMappingView} */
    const tableView = this.getView();
    const ruleItem = component.getRuleItem();
    const sampleItems = component.getSampleItems();
    tableView.addColumnAt(ruleItem.getView(), sampleItems.getView(), index);

    /** @type {ColumnFocusManager} */
    const focusManager = super.getFocusManager();
    focusManager.addColumnAt(index, ruleItem.getDecoratedElementByName('ListItemDecorator'), sampleItems);
  }
  /** @override */
  replaceAllItems(treeItemArray) {
    /** @type {ColumnFocusManager} */
    const focusManager = super.getFocusManager();
    const hasFocus = focusManager.isCurrentHasFocused();

    super.replaceAllItems(treeItemArray);

    focusManager.addColumn(this.#addRuleButton);
    if (hasFocus) {
      focusManager.giveFocus();
    }
  }
  /** @override */
  removeAllItemsViews() {
    /** @type {ColumnFocusManager} */
    const focusManager = super.getFocusManager();
    focusManager.removeAllColumns();

    /** @type {SampleMappingView} */
    const tableView = this.getView();
    tableView.removeAllColumns();
  }

  /** @override */
  removeItemView(index) {
    // NOTE : avertir le focusManager avant la suppression effective pour donner le focus à un autre élément que si le focus était dans la vue supprimée
    /** @type {ColumnFocusManager} */
    const focusManager = super.getFocusManager();
    focusManager.removeColumn(index);

    /** @type {SampleMappingView} */
    const tableView = this.getView();
    tableView.removeColumn(index);
  }

  /** @override */
  added(parent) {
    super.added(parent);

    /** @type {ColumnFocusManager} */
    const focusManager = super.getFocusManager();
    focusManager.addColumn(this.#addRuleButton);
    focusManager.enableKeyNavigation();
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