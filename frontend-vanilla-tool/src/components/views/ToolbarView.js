import CompositeView from './CompositeView.js';
import FocusManager from './FocusManager.js';

class ToolbarView extends CompositeView {

  name = 'ToolbarView';

  /** @type {FocusManager} */
  #focusManager = null;

  constructor() {
    super();
    this.#focusManager = new FocusManager(this.getElementView(), 'horizontal', false, false);
  }
  /**
   * @override {@link View.getHtmlView}
   */
  getHtmlView() {
    return String.raw`<div id="spaceChildren" class="toolbar toolbar__space" role="toolbar"></div>`;
  }

  addView(view) {
    super.addView(view);

    this.#focusManager.addFocusableElement(view.getElementView());
  }

  added(parent) {
    super.added(parent);

    this.#focusManager.listenKeys();
  }

  destroy() {
    super.destroy();
    this.#focusManager.stopListenKeys();
  }

}

export default ToolbarView;