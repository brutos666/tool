import SpaceView from './SpaceView.js';

class NavSpaceView extends SpaceView {

  name = 'NavSpaceView';

  constructor() {
    super();
  }

  getHtmlView() {
    return String.raw`<nav id="navSpace" class="nav-space">
    <div class="nav-space__header">Navigation</div>
    <section class="nav-space__space items-navigation__space" tabindex="0">
      <template class="nav-tree__content" id="treeItems" role="tree" ></template>
    </section>
  </nav>`;
  }

}

export default NavSpaceView;