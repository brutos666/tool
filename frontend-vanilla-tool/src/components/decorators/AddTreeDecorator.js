import ActionButton from '../ActionButton.js';
import Toolbar from '../Toolbar.js';
import Decorator from './Decorator.js';
import AddTreeDecoratorView from './views/AddTreeDecoratorView.js';
/** @import TreeItem from '../../data/TreeItem.js'; */

class AddTreeDecorator extends Decorator {

  /** @type {TreeItem} */
  #treeItem;

  /**
   * @constructor
   * @param {Component} decoratedElement
   * @param {Object} data
   * @param {TreeItem} data.treeItem
   * @param {string} data.label
   */
  constructor(decoratedElement, data) {
    super(new AddTreeDecoratorView(decoratedElement.getView()), decoratedElement);
    this.#treeItem = data.treeItem;

    const addNewItemAction = new ActionButton({ id: 'addNewItem', label: data.label });
    addNewItemAction.setDoActionCallback(this.addNewItem.bind(this));
    const toolbar = new Toolbar();
    toolbar.addChild(addNewItemAction);
    this.setStaticChild('toolbar', toolbar);
  }

  setTreeItem(treeItem) {
    this.#treeItem = treeItem;
  }

  addNewItem() {
    this.#treeItem.addItem({ title: 'Nouvel espace', text: '', state: 'TODO', children: [] });
  }

}

export default AddTreeDecorator;