import CompositeView from './CompositeView.js';
import KeyNavigationMixin from './KeyNavigationMixIn.js';

const mix = superclass => ({
  with(mixin) {
    return mixin(superclass);
  }
});

class ToolbarView extends mix(CompositeView)
  .with(KeyNavigationMixin) {

  name = 'ToolbarView KeyNavigationMixin';

  constructor() {
    super();
  }
  /**
   * @override {@link View.getHtmlView}
   */
  getHtmlView() {
    return String.raw`<div id="spaceChildren" class="toolbar toolbar__space" role="toolbar"></div>`;
  }

  added(parent) {
    super.added(parent);

    this.setNavigation(this.getElementView(), 'horizontal', false);
  }

}

export default ToolbarView;