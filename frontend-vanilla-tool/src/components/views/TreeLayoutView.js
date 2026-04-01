import PlacedCompositeView from './PlacedCompositeView.js';

class TreeLayoutView extends PlacedCompositeView {

  constructor(data) {
    super(data);
  }
  /**
   * @override
   * Cette classe s'occupe de disposer les 2 enfants
   * @param {View} view
   */
  addView(view) {
    if (this.getView('treeToolbar') === undefined) {
      super.setView('treeToolbar', view);
    } else {
      super.addView(view);
    }
  }
  getHtmlView() {
    return String.raw`<div class="tree"><div id="treeToolbar" class="tree__toolbar"></div>
      <div id="spaceChildren" class="tree__space"></div>
    </div>`;
  }

}

export default TreeLayoutView;