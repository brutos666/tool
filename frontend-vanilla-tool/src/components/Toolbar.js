import Composite from './Composite.js';
import FocusManager from './FocusManager.js';
import ToolbarView from './views/ToolbarView.js';

class Toolbar extends Composite {

  constructor() {
    super(new ToolbarView());
    super.setFocusManager(new FocusManager(this.getElementView(), 'horizontal', false, false));
  }
  /**
   * @override
   * @returns {ToolbarView}
   */
  getView() {
    return super.getView();
  }

  /** @override */
  addChild(element) {
    super.addChild(element);

    super.getFocusManager()
      .addFocusable(element);
  }

  /** @override */
  added(parent) {
    super.added(parent);

    super.getFocusManager()
      .listenKeys();
  }

}

export default Toolbar;