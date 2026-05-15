import SpaceView from './SpaceView.js';

class NavSpaceView extends SpaceView {

  name = 'NavSpaceView';

  constructor() {
    super();
    this.setCurrentSpace();
  }

  getHtmlView() {
    return String.raw`<nav id="navSpace" class="nav-space">
    <div class="nav-space__header">Navigation</div>
    <template id="navTree" class="nav-space__tree"></template>
  </nav>`;
  }

}

export default NavSpaceView;