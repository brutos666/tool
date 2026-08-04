import ItemsView from './ItemsView.js';
import TreeFocusManager from './TreeFocusManager.js';

class TreeListView extends ItemsView {

  name = 'TreeListView';

  constructor(data) {
    super(data);
    this.getElementView()
      .classList.add('tree-list__space');
    // NOTE : le système de focus est positionné mais l'écoute des touches de navigation ne doit pas être effective au départ. C'est le composant qui contient les racines des arbres qui doit piloter au départ
    super.setFocusManager(new TreeFocusManager(this.getElementView(), 'vertical', true));
  }

  addItemView(itemView) {
    super.addItemView(itemView);
    super.getFocusManager()
      .addFocusableView(itemView.getDecoratedViewByName('TreeView'));
  }

  addItemViewAt(itemView, index) {
    super.addItemViewAt(itemView, index);
    super.getFocusManager()
      .addFocusableView(itemView.getDecoratedViewByName('TreeView'), '.tree');
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

}

export default TreeListView;