import ItemsView from './ItemsView.js';

class CheckListView extends ItemsView {

  name = 'CheckListView';

  constructor() {
    super({ addButton: true });
  }

  getHtmlView() {
    return String.raw`<div class="check-list">
    <header class="check-list__header"><template class="check-list__header-title" id="title"></template></header>
    <section class="check-list__space">
      <ol id="itemsSpace" class="items__space" role="tree" aria-orientation="horizontal"><li class="list__element"><template id="addItemAction"></template></li></ol>
    </section></div>`;
  }

}

export default CheckListView;