import ItemsView from './ItemsView.js';

class CheckListView extends ItemsView {

  name = 'CheckListView';

  constructor() {
    super({ addButton: true });
    this.getElementView()
      .querySelector('.items')
      .classList.add('check-list__space');
  }

  getHtmlView(data) {
    const itemsViewHtml = super.getHtmlView(data);
    return String.raw`<div class="check-list"><header class="check-list__header"><template class="check-list__header-title" id="title"></template></header>${ itemsViewHtml }</div>`;
  }

}

export default CheckListView;