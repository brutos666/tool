import CompositeView from './CompositeView.js';

class ToolbarView extends CompositeView {

  constructor() {
    super();
  }
  /**
   * @override {@link View.getHtmlView}
   */
  getHtmlView() {
    return String.raw`<div id="spaceChildren" class="toolbar toolbar__space"></div>`;
  }

}

export default ToolbarView;