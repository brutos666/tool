import View from './View.js';
/**
 * @typedef {Object} Option
 * @prop {string} value
 * @prop {string} label
 */

class SelectView extends View {

  #doSelectCallback;
  /**
   * @constructor
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du select
   * @param {Array<Option>} data.options - Liste des options du select
   */
  constructor(data) {
    super(data);
    this.getElementView()
      .addEventListener('change', this.callDoSelectCallback.bind(this));
  }

  setDoSelectCallback(callback) {
    this.#doSelectCallback = callback;
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
   */
  getHtmlView(data) {
    let htmlText = String.raw`<select id="${ data.id }" class="clickable">`;
    for (const option of data.options) {
      htmlText += String.raw`<option value="${ option.value }">${ option.label }</option>`;
    }
    htmlText += String.raw`</select>`;
    return htmlText;
  }

}

export default SelectView;