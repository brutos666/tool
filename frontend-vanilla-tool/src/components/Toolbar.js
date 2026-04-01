import Composite from './Composite.js';
import ToolbarView from './views/ToolbarView.js';

class Toolbar extends Composite {

  constructor() {
    super(new ToolbarView());
  }
  /**
   * @override
   * @returns {ToolbarView}
   */
  getView() {
    return super.getView();
  }

}

export default Toolbar;