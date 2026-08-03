import ItemsView from './ItemsView.js';
import TreeFocusManager from './TreeFocusManager.js';

class CheckListView extends ItemsView {

  name = 'CheckListView';

  /** @type {TreeFocusManager} */
  #focusManager = null;

  constructor() {
    super({ addButton: true });
    this.#focusManager = new TreeFocusManager(this.getElementView(), 'horizontal', false);
  }
  getFocusManager() {
    return this.#focusManager;
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
    this.#focusManager.addFocusableView(itemView.getDecoratedViewByName('TreeView'));
  }

  addItemViewAt(itemView, index) {
    super.addItemViewAt(itemView, index);
    this.#focusManager.addFocusableView(itemView.getDecoratedViewByName('TreeView'));
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

    this.getStaticView('title')
      .getDecoratedViewByName('ItemView')
      .getElementView()
      .setAttribute('tabindex', 0);

    this.#focusManager.setParent(parent);
    this.#focusManager.listenKeys();
  }

  destroy() {
    super.destroy();
    this.#focusManager.stopListenKeys();
  }

}

export default CheckListView;