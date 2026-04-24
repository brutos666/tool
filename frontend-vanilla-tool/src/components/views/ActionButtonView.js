import View from './View.js';

class ActionButtonView extends View {

  #doActionCallback;

  /**
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   */
  constructor(data) {
    super(data);
    this.getElementView()
      .addEventListener('click', this.callDoActionCallback.bind(this));
  }

  /**
   * @override {@link View.getHtmlView}
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   * @param {string} data.role - Rôle du bouton
   * @returns {string} - Code HTML du bouton
   */
  getHtmlView(data) {
    return String.raw`<button id="${ data.id }" class="clickable action__button" role="${ data.role }">
      <span>${ data.label }</span></button>`;
  }

  setDoActionCallback(callback) {
    this.#doActionCallback = callback;
  }

  getDoActionCallback() {
    return this.#doActionCallback;
  }

  callDoActionCallback() {
    this.#doActionCallback();
  }

}
export default ActionButtonView;