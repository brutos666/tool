import CompositeView from './CompositeView.js';

class HomePageView extends CompositeView {

  constructor() {
    super();
    this.createView(String.raw`<div>
      <header class="header"><div class="header-content"><h3>Tâches</h3></div></header>
      <div id="spaceChildren"></div>
    </div>`);
  }

}
export default HomePageView;