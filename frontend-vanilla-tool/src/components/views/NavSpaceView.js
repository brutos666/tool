import SpaceView from './SpaceView.js';

class NavSpaceView extends SpaceView {

  name = 'NavSpaceView';

  constructor() {
    super();
    this.setCurrentSpace();
  }

  getHtmlView() {
    return String.raw`<aside id="navSpace" class="nav-space">
    <header class="nav-space__header"><h1 class="nav-space__title">Navigation</h1></header>
    <template id="navTree" class="nav-space__tree"></template>
  </aside>`;
  }

}

export default NavSpaceView;