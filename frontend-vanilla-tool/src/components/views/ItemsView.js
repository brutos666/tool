import View from './View.js';

class ItemsView extends View {

  name = 'ItemsView';

  #itemViews = [];
  #addButton = true;

  /**
   *
   * @param {Object} data
   * @param {boolean} data.addButton : Indique si il faut ajouter le bouton d'ajout
   */
  constructor(data) {
    super(data);
    this.#addButton = data.addButton;
  }

  addItemView(itemView) {
    const itemsSpace = getItemsSpace(this.getElementView());
    if (this.#addButton) {
      itemsSpace.insertBefore(itemView.getElementView(), itemsSpace.lastChild);
    } else {
      itemsSpace.appendChild(itemView.getElementView());
    }
    this.#itemViews.push(itemView);
    itemView.added();
  }

  addItemViewAt(itemView, index) {
    const itemsSpace = getItemsSpace(this.getElementView());
    itemsSpace.insertBefore(itemView.getElementView(), itemsSpace.children[index]);
    this.#itemViews.splice(index, 0, itemView);
    itemView.added();
  }

  removeItemView(index) {
    const itemView = this.#itemViews[index];
    const itemElementView = itemView.getElementView();
    itemElementView.parentNode.removeChild(itemElementView);
    this.#itemViews.splice(index, 1);
    itemView.removed();
  }

  removeAllItemsViews() {
    this.#itemViews.forEach(itemView => {
      const itemElementView = itemView.getElementView();
      itemElementView.parentNode.removeChild(itemElementView);
      itemView.removed();
    });
    this.#itemViews = [];
  }

  /**
   *
   * @param {Object} data
   * @param {boolean} data.addButton : Indique si il faut ajouter le bouton d'ajout
   */
  getHtmlView(data) {
    if (data.addButton) {
      return String.raw`<ol id="itemsSpace" class="items__space" aria-orientation="vertical"><li class="list__element"><template id="addItemAction"></template></li></ol>`;
    }
    return String.raw`<ol id="itemsSpace" class="items__space" aria-orientation="vertical"></ol>`;
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