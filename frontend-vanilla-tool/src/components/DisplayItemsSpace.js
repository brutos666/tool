import Component from './Component.js';

class DisplayItemsSpace extends Component {

  #treeItem;

  constructor(view) {
    super(view);
  }
  getTreeItem() {
    return this.#treeItem;
  }
  setTreeItem(treeItem) {
    this.#treeItem = treeItem;
  }

  addNewItem() {
    if (this.#treeItem) {
      this.#treeItem.addItem({ title: 'Nouvelle tâche', state: 'TODO', children: [] });
    }
  }

}

export default DisplayItemsSpace;