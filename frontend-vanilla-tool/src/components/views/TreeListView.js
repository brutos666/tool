import CompositeView from './CompositeView.js';

class TreeListView extends CompositeView {

  name = 'TreeListView';

  getHtmlView() {
    return String.raw`<div class="tree">
      <div id="spaceChildren" class="tree__space"></div>
    </div>`;
  }

}

export default TreeListView;