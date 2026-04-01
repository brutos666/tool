import CompositeView from './CompositeView.js';

class TreeLayoutView extends CompositeView {

  name = 'TreeLayoutView';

  constructor(data) {
    super(data);
  }

  getHtmlView() {
    return String.raw`<div class="tree-layout">
      <header class="tree-layout__header"><template id="addNewSpace"></template></header>
      <template id="treeItems" class="tree-layout__space"></template>
    </div>`;
  }

}

export default TreeLayoutView;