import View from './View.js';

class ActionView extends View {

  name = 'ActionView';

  #doActionCallback = () => {};

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
    // Empêche le comportement par défaut du bouton, soit la perte de focus sur un élément lorsque l'on clique sur un bouton
    this.getElementView()
      .addEventListener('mousedown', e => e.preventDefault());
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

  /**
   * Lance l'action
   * @param {Event} event
   */

  callDoActionCallback(event) {
    event.stopPropagation();
    this.#doActionCallback();
  }

  setReadOnly() {
    super.setReadOnly();
    this.getElementView()
      .disabled = true;
  }

  setDisabled() {
    super.setDisabled();
    this.getElementView()
      .disabled = true;
  }

  setEnabled() {
    super.setEnabled();
    this.getElementView()
      .disabled = false;
  }

}
export default ActionView;