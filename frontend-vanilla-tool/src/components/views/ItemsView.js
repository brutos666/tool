import View from './View.js';

class ItemsView extends View {

  name = 'ItemsView';

  #itemViews = [];

  constructor(data) {
    super(data);
  }

  addItemViewAt(itemView, index) {
    const itemsSpace = getItemsSpace(this.getElementView());
    itemsSpace.insertBefore(itemView.getElementView(), itemsSpace.children[index]);
    this.#itemViews.splice(index, 0, itemView);
  }

  removeItemView(index) {
    const itemView = this.#itemViews[index];
    const itemElementView = itemView.getElementView();
    itemElementView.parentNode.removeChild(itemElementView);
    this.#itemViews.splice(index, 1);
  }

  removeAllItemsViews() {
    this.#itemViews.forEach(itemView => {
      const itemElementView = itemView.getElementView();
      itemElementView.parentNode.removeChild(itemElementView);
    });
    this.#itemViews = [];
  }

  getHtmlView() {
    return String.raw`<ul id="itemsSpace" class="items__space" aria-orientation="vertical"></ul>`;
  }

}
/**
 * @private
 * Determine l'espace contenant les items
 * @param {Element} elementView
 * @returns {Element}
 */
function getItemsSpace(elementView) {
  if (!elementView.classList.contains('items__space')) {
    return elementView.querySelector('.items__space');
  }
  return elementView;
}

export default ItemsView;