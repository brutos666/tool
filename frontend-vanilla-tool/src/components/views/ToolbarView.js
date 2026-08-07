import CompositeView from './CompositeView.js';

class ToolbarView extends CompositeView {

  name = 'ToolbarView';

  constructor() {
    super();
  }
  /**
   * @override {@link View.getHtmlView}
   */
  getHtmlView() {
    return String.raw`<div id="spaceChildren" class="toolbar toolbar__space" role="toolbar"></div>`;
  }

}

export default ToolbarView;