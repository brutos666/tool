import CommandDecoratorView from './CommandDecoratorView.js';
/** @import ItemView from '../../../components/views/ItemView.js'; */

class CommandItemDecoratorView extends CommandDecoratorView {

  name = 'CommandItemDecoratorView';

  #onBlurCallback = () => {};
  /**
   *
   * @param {ItemView} itemView
   */
  constructor(itemView) {
    super(itemView);
  }
  /**
   * Positionne la fonction à appeler lorsque l'item perd le focus
   * @param {Function} onBlurCallback - Fonction à appeler lorsque l'item perd le focus
   */
  setOnBlurCallback(onBlurCallback) {
    this.getElementView()
      .removeEventListener('blur', this.#onBlurCallback, true);

    this.#onBlurCallback = event => {
      if (!this.getElementView()
        .contains(event.relatedTarget)) {
        onBlurCallback();
      }
    };
    this.getElementView()
      .addEventListener('blur', this.#onBlurCallback, true);
  }

}

export default CommandItemDecoratorView;