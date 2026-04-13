import View from './View.js';

class ItemsView extends View {

  name = 'ItemsView';

  #itemNodes = [];

  constructor(data) {
    super(data);
  }

  addItemView(itemView) {
    const itemsSpace = this.getElementView()
      .querySelector('.items__space');
    itemsSpace.insertBefore(itemView.getElementView(), itemsSpace.lastChild);

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

  getHtmlView() {
    return String.raw`<div class="items"><div id="itemsSpace" class="items__space"><template id="addItemAction" class="items__add-item"></template></div></div>`;
  }

}

export default ItemsView;