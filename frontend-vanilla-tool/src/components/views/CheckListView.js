import View from './View.js';

class CheckListView extends View {

  name = 'CheckListView';

  constructor(data) {
    super(data);
  }

  getHtmlView() {
    return String.raw`<div class="check-list"><header class="check-list__header"><template class="check-list__header-title" id="header"></template></header><template class="check-list__space" id="todoItems" ></template></div>`;
  }

}

export default CheckListView;