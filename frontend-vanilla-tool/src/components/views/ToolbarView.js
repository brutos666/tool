import CompositeView from './CompositeView.js';

class ToolbarView extends CompositeView {

  constructor() {
    super();
  }
  /**
   * @override {@link View.getHtmlView}
   */
  getHtmlView() {
    return String.raw`<div class="toolbar"><section id="spaceChildren" class="toolbar__space"></section></div>`;
  }

}

export default ToolbarView;