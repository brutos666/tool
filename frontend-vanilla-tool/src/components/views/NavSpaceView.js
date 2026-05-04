import View from './View.js';

class NavSpaceView extends View {

  name = 'NavSpaceView';

  getHtmlView() {
    return String.raw`<nav id="navSpace" class="nav-space">
    <h4>Navigation</h4>
    <template class="nav-tree__content" id="treeItems" ></template>
  </nav>`;
  }

}

export default NavSpaceView;