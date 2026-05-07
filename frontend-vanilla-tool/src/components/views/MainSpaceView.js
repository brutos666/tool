import SpaceView from './SpaceView.js';

class MainSpaceView extends SpaceView {

  constructor() {
    super();
  }
  getHtmlView() {
    return String.raw`<main id="mainSpace" class="main-space">
    <template id="toolbar" class="main-space__toolbar"></template>
    <template id="main" class="main-space__content" ></template>
  </main>`;
  }

}

export default MainSpaceView;