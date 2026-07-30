import FocusManager from './FocusManager.js';
import ItemsView from './ItemsView.js';

class CheckListView extends ItemsView {

  name = 'CheckListView';

  /** @type {FocusManager} */
  #focusManager = null;

  constructor() {
    super({ addButton: true });
    this.#focusManager = new FocusManager(this.getElementView(), 'horizontal', false);
  }

  getHtmlView() {
    return String.raw`<div class="check-list">
    <header class="check-list__header"><template class="check-list__header-title" id="title"></template></header>
    <section class="check-list__space">
      <ol id="itemsSpace" class="items__space" role="tree" aria-orientation="horizontal"><li class="list__element"><template id="addItemAction"></template></li></ol>
    </section></div>`;
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

export default CheckListView;