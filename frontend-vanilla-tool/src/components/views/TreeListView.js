import CompositeView from './CompositeView.js';

class TreeListView extends CompositeView {

  name = 'TreeListView';

  getHtmlView() {
    return String.raw`<div class="tree-list">
      <div id="spaceChildren" class="tree-list__space"></div>
    </div>`;
  }

}

export default TreeListView;