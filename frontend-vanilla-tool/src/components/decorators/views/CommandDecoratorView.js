import { NOTIFICATION_TIMEOUT } from '../../../tools/Constants.js';
import DecoratorView from './DecoratorView.js';
/** @import View from '../../views/View.js'; */

class CommandDecoratorView extends DecoratorView {

  name = 'CommandDecoratorView';

  #messageView;
  /**
   * @constructor
   * @param {View} view
   */
  constructor(view) {
    super(view);
    this.#messageView = this.getNodeView()
      .querySelector('.message');
  }

  getHtmlView() {
    return String.raw`<div class="command--decorator"><template></template>
      <div class="message hidden"></div></div>`;
  }

  setError(value) {
    this.#messageView.textContent = value;
    this.#messageView.classList.add('error-mess');
    this.#messageView.classList.remove('error-mess');
    this.#messageView.classList.remove('hidden');
  }

  setSuccess(value) {
    this.#messageView.textContent = value;
    this.#messageView.classList.remove('error-mess');
    this.#messageView.classList.add('success-mess');
    this.#messageView.classList.remove('hidden');
    // Effacer le message au bout d'un peu de temps
    setTimeout(() => this.#messageView.classList.add('hidden'), NOTIFICATION_TIMEOUT);
  }

  showSpinner() {
    this.getElementView().classList.add('loading');
  }

  hideSpinner() {
    this.getElementView().classList.remove('loading');
  }

}

export default CommandDecoratorView;