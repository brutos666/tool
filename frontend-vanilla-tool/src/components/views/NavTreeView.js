import View from './View.js';

class NavTreeView extends View {

  name = 'NavTreeView';

  getHtmlView() {
    return String.raw`<section>
      <template class="nav-tree__content" id="treeItems" role="tree" ></template>
    </section>`;
  }

}

export default NavTreeView;