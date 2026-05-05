import ItemsView from './ItemsView.js';

class CheckListView extends ItemsView {

  name = 'CheckListView';

  constructor() {
    super({ addButton: true });
    const itemsSpace = this.getElementView()
      .querySelector('.items__space');
    itemsSpace.setAttribute('role', 'tree');
  }

  getHtmlView(data) {
    const itemsViewHtml = super.getHtmlView(data);
    return String.raw`<div class="check-list"><header class="check-list__header"><template class="check-list__header-title" id="title"></template></header><section class="check-list__space">${ itemsViewHtml }</section></div>`;
  }

}

export default CheckListView;