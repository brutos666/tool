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
    let itemsSpace = this.getElementView();
    if (!itemsSpace.classList.contains('items__space')) {
      itemsSpace = this.getElementView()
        .querySelector('.items__space');
    }
    if (this.#addButton) {
      itemsSpace.insertBefore(itemView.getElementView(), itemsSpace.lastChild);
    } else {
      itemsSpace.appendChild(itemView.getElementView());
    }

    this.#itemNodes.push(itemView.getElementView());
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
      return String.raw`<ol id="itemsSpace" class="items__space"><template id="addItemAction"></template></ol>`;
    }
    return String.raw`<ol id="itemsSpace" class="items__space"></ol>`;
  }

}

export default ItemsView;