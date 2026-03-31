import CompositeView from './CompositeView.js';

class TreeLayoutView extends CompositeView {

  constructor(data) {
    super(data);
  }

  getHtmlView() {
    return String.raw`<div class="tree"><header class="tree__header">Arbre hiérarchique</header>
      <div id="spaceChildren" class="tree__space"></div>
    </div>`;
  }

}

export default TreeLayoutView;