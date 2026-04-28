import View from './View.js';

class ActionView extends View {

  name = 'ActionView';

  #doActionCallback;

  /**
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   * @param {string} data.icon - Icône du bouton
   * @param {string} data.role - Rôle du bouton
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
   * @param {string|undefined} data.icon - Icône du bouton
   * @param {string} data.role - Rôle du bouton
   * @returns {string} - Code HTML du bouton
   */
  getHtmlView(data) {
    const icon = data.icon ? `<span class="button__icon">${ data.icon }</span>` : '';
    return String.raw`<button id="${ data.id }" class="clickable" role="${ data.role }">
      ${ icon }
      <span class="button__label">${ data.label }</span></button>`;
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
export default ActionView;