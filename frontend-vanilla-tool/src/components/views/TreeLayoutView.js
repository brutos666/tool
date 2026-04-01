import CompositeView from './CompositeView.js';

class TreeLayoutView extends CompositeView {

  constructor(data) {
    super(data);
  }

  getHtmlView() {
    return String.raw`<div class="tree-layout">
      <header class="tree-layout__header"><template id="addNewSpace"></template></header>
      <div id="spaceChildren" class="tree-layout__space"></div>
    </div>`;
  }

}

export default TreeLayoutView;