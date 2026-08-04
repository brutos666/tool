import CompositeView from './CompositeView.js';
import FocusManager from './FocusManager.js';

class ToolbarView extends CompositeView {

  name = 'ToolbarView';

  constructor() {
    super();
    super.setFocusManager(new FocusManager(this.getElementView(), 'horizontal', false, false));
  }
  /**
   * @override {@link View.getHtmlView}
   */
  getHtmlView() {
    return String.raw`<div id="spaceChildren" class="toolbar toolbar__space" role="toolbar"></div>`;
  }

  addView(view) {
    super.addView(view);

    super.getFocusManager()
      .addFocusableView(view);
  }

  added(parent) {
    super.added(parent);

    super.getFocusManager()
      .listenKeys();
  }

}

export default ToolbarView;