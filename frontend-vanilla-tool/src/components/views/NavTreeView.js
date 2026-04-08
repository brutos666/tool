import View from './View.js';

class NavTreeView extends View {

  name = 'NavTreeView';

  constructor(data) {
    super(data);
  }

  getHtmlView() {
    return String.raw`<div class="nav-tree">
      <header class="nav-tree__header"><template id="toolbar"></template></header>
      <template class="nav-tree__space" id="treeItems" ></template>
    </div>`;
  }

}

export default NavTreeView;