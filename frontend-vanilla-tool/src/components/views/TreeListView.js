import ItemsView from './ItemsView.js';
import TreeFocusManager from './TreeFocusManager.js';

class TreeListView extends ItemsView {

  name = 'TreeListView';

  /** @type {TreeFocusManager} */
  #focusManager = null;

  constructor(data) {
    super(data);
    this.getElementView()
      .classList.add('tree-list__space');
    // NOTE : le système de focus est positionné mais l'écoute des touches de navigation ne doit pas être effective au départ. C'est le composant qui contient les racines des arbres qui doit piloter au départ
    this.#focusManager = new TreeFocusManager(this.getElementView(), 'vertical', true);
  }

  getFocusManager() {
    return this.#focusManager;
  }

  addItemView(itemView) {
    super.addItemView(itemView);
    this.#focusManager.addFocusableView(itemView.getDecoratedViewByName('TreeView'));
  }

  addItemViewAt(itemView, index) {
    super.addItemViewAt(itemView, index);
    this.#focusManager.addFocusableView(itemView.getDecoratedViewByName('TreeView'), '.tree');
  }

  removeItemView(index) {
    super.removeItemView(index);
    this.#focusManager.removeFocusableView(index);
  }

  removeAllItemsViews() {
    super.removeAllItemsViews();
    this.#focusManager.removeAllFocusableViews();
  }

  added(parent) {
    super.added(parent);
    this.#focusManager.setParent(parent);
  }

  destroy() {
    super.destroy();
    this.#focusManager.stopListenKeys();
  }

}

export default TreeListView;