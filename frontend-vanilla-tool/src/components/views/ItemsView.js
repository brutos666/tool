import View from './View.js';

class ItemsView extends View {

  name = 'ItemsView';

  #itemNodes = [];
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
    this.#itemNodes.push(itemView.getElementView());
  }

  addItemViewAt(itemView, index) {
    const itemsSpace = getItemsSpace(this.getElementView());
    itemsSpace.insertBefore(itemView.getElementView(), itemsSpace.children[index]);
    this.#itemNodes.splice(index, 0, itemView.getElementView());
  }

  removeItemView(index) {
    this.#itemNodes[index].parentNode.removeChild(this.#itemNodes[index]);
    this.#itemNodes.splice(index, 1);
  }

  removeAllItemsViews() {
    this.#itemNodes.forEach(itemNode => itemNode.parentNode.removeChild(itemNode));
    this.#itemNodes = [];
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