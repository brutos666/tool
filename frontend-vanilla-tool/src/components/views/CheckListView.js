import ItemsView from './ItemsView.js';

class CheckListView extends ItemsView {

  name = 'CheckListView';

  constructor() {
    super({ addButton: false });
  }

  getHtmlView() {
    return String.raw`<div class="check-list">
    <header class="check-list__header"><template class="check-list__title" id="title"></template></header>
    <ol id="itemsSpace" class="check-list__items items__space" role="tree" aria-orientation="horizontal"></ol>
    <footer class="check-list__footer"><template id="addItemAction" tabindex="0"></template></footer>
    </div>`;
  }

}

export default CheckListView;