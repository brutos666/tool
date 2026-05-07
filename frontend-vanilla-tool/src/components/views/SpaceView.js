import View from './View.js';
import StoreData from '../../data/StoreData.js';

class SpaceView extends View {

  name = 'SpaceView';

  constructor() {
    super();
    const elementView = this.getElementView();
    elementView.addEventListener('mousedown', this.onMouseDown.bind(this));
    elementView.addEventListener('focusin', this.onFocusIn.bind(this));
  }

  onFocusIn() {
    if (!this.isCurrent()) {
      this.setCurrentSpace();
    }
  }
  /**
   * Click sur le bouton de la souris
   * @param {Event} event
   */
  onMouseDown() {
    this.setCurrentSpace();
  }

  setCurrentSpace() {
    StoreData.getCurrentSpace()
      ?.removeCurrent();
    StoreData.setCurrentSpace(this);
    this.setCurrent();
  }

}

export default SpaceView;