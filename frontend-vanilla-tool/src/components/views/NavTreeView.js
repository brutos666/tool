import View from './View.js';

class NavTreeView extends View {

  name = 'NavTreeView';

  constructor(data) {
    super(data);
  }

  getHtmlView() {
    return String.raw`<div class="nav-tree" id="navTree">
      <template class="nav-tree__toolbar" id="toolbar"></template>
      <template class="nav-tree__space" id="treeItems" ></template>
    </div>`;
  }

}

export default NavTreeView;