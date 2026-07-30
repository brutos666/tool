import FocusManager from './FocusManager.js';
import ItemsView from './ItemsView.js';

class TreeListView extends ItemsView {

  name = 'TreeListView';

  /** @type {FocusManager} */
  #focusManager = null;

  constructor(data) {
    super(data);
    this.getElementView()
      .classList.add('tree-list__space');
    this.#focusManager = new FocusManager(this.getElementView(), 'vertical', false);
  }

  addItemView(itemView) {
    super.addItemView(itemView);
    this.#focusManager.addFocusableElement(itemView.getElementView(), '.tree');
  }

  addItemViewAt(itemView, index) {
    super.addItemViewAt(itemView, index);
    this.#focusManager.addFocusableElement(itemView.getElementView());
  }

  removeItemView(index) {
    super.removeItemView(index);
    this.#focusManager.removeFocusableElement(index);
  }

  removeAllItemsViews() {
    super.removeAllItemsViews();
    this.#focusManager.removeAllFocusableElement();
  }

  added(parent) {
    super.added(parent);
    this.#focusManager.listenKeys();
  }

  destroy() {
    super.destroy();
    this.#focusManager.stopListenKeys();
  }

}

export default TreeListView;