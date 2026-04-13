import ItemsView from './ItemsView.js';

class CheckListView extends ItemsView {

  name = 'CheckListView';

  constructor(data) {
    super(data);
    this.getElementView()
      .querySelector('.items')
      .classList.add('check-list__space');
  }

  getHtmlView() {
    const itemsViewHtml = super.getHtmlView();
    return String.raw`<div class="check-list"><header class="check-list__header"><template class="check-list__header-title" id="title"></template></header>${ itemsViewHtml }</div>`;
  }

}

export default CheckListView;