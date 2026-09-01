import View from './View.js';
/**
 * @typedef {Object} Option
 * @prop {string} value
 * @prop {string} label
 */

class SelectView extends View {

  #onChangeEvent = this.callDoSelectCallback.bind(this);
  #doSelectCallback;
  /**
   * @constructor
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du select
   * @param {Array<Option>} data.options - Liste des options du select
   * @param {string} data.value - Valeur initiale
   */
  constructor(data) {
    super(data);
    this.getElementView()
      .addEventListener('change', this.#onChangeEvent);
    this.getElementView()
      .value = data.value;
  }

  setDoSelectCallback(callback) {
    this.#doSelectCallback = callback;
    const value = this.getElementView()
      .value;
    if (value) {
      this.#doSelectCallback(value);
    }
  }

  getDoSelectCallback() {
    return this.#doSelectCallback;
  }

  callDoSelectCallback(event) {
    this.#doSelectCallback(event.target.value);
  }

  /**
   * @override {@link View.getHtmlView}
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du select
   * @param {Array<Option>} data.options - Liste des options du select
   * @param {string} data.value - Valeur initiale
   * @returns {string} - Code HTML du select
   */
  getHtmlView(data) {
    let htmlText = String.raw`<select id="${ data.id }" class="clickable">`;
    for (const option of data.options) {
      htmlText += String.raw`<option value="${ option.value }">${ option.label }</option>`;
    }
    htmlText += String.raw`</select>`;
    return htmlText;
  }

  destroy() {
    this.getElementView()
      .removeEventListener('change', this.#onChangeEvent);

    super.destroy();

    this.#doSelectCallback = null;
    this.#onChangeEvent = null;
  }

}

export default SelectView;