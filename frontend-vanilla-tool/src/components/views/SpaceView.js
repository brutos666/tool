import StoreData from '../../data/StoreData.js';
import View from './View.js';

class SpaceView extends View {

  name = 'SpaceView';

  #onMouseDownEvent = this.onMouseDown.bind(this);
  #onFocusInEvent = this.onFocusIn.bind(this);

  constructor() {
    super();
    const elementView = this.getElementView();
    elementView.addEventListener('mousedown', this.#onMouseDownEvent);
    elementView.addEventListener('focusin', this.#onFocusInEvent);
  }

  onFocusIn() {
    this.setCurrentSpace();
  }
  /**
   * Click sur le bouton de la souris
   * @param {Event} event
   */
  onMouseDown() {
    this.setCurrentSpace();
  }

  setCurrentSpace() {
    if (this.isCurrent()) {
      return;
    }
    StoreData.getCurrentSpace()
      ?.removeCurrent();
    StoreData.setCurrentSpace(this);
    this.setCurrent();
  }

  /** @override */
  destroy() {
    const elementView = this.getElementView();
    elementView.removeEventListener('mousedown', this.#onMouseDownEvent);
    elementView.removeEventListener('focusin', this.#onFocusInEvent);
  }

}

export default SpaceView;