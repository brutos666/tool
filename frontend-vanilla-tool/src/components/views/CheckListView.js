import ItemsView from './ItemsView.js';
import TreeFocusManager from './TreeFocusManager.js';

class CheckListView extends ItemsView {

  name = 'CheckListView';

  constructor() {
    super({ addButton: true });
    super.setFocusManager(new TreeFocusManager(this.getElementView(), 'horizontal', false));
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
    super.getFocusManager()
      .addFocusableView(itemView.getDecoratedViewByName('TreeView'));
  }

  addItemViewAt(itemView, index) {
    super.addItemViewAt(itemView, index);
    super.getFocusManager()
      .addFocusableView(itemView.getDecoratedViewByName('TreeView'));
  }

  removeItemView(index) {
    super.removeItemView(index);
    super.getFocusManager()
      .removeFocusableView(index);
  }

  removeAllItemsViews() {
    super.removeAllItemsViews();
    super.getFocusManager()
      .removeAllFocusableViews();
  }

  added(parent) {
    super.added(parent);

    this.getStaticView('title')
      .getDecoratedViewByName('ItemView')
      .getElementView()
      .setAttribute('tabindex', 0);

    super.getFocusManager()
      .listenKeys();
  }

}

export default CheckListView;