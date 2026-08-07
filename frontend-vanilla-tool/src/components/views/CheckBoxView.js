import View from './View.js';
/**
 * Cette classe représente la vue d'un composant CheckBox ou d'un toggle switch
 * Le role et la classe s'occupera de faire la distinction entre les deux
 */
class CheckBoxView extends View {

  name = 'CheckBoxView';

  #toggleCallback;
  #checkbox;

  constructor(data) {
    super(data);
    this.#checkbox = this.getElementView()
      .querySelector('input');
    this.#checkbox.addEventListener('change', this.callToggleCallback.bind(this));
  }
  /**
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   * @param {string} data.role - Rôle du bouton
   * @param {checkbox|toggle} data.type - Type case à cocher ou bascule
   */
  getHtmlView(data) {
    return String.raw`<div class="${ data.type }"><input type="checkbox" id="${ data.id }" role="${ data.role }" class="${ data.type }__input clickable"><label class="${ data.type }__label" for="${ data.id }">${ data.label }</label></div>`;
  }
  setToggleCallback(callback) {
    this.#toggleCallback = callback;
  }

  getToggleCallback() {
    return this.#toggleCallback;
  }

  /**
   * Lance l'action
   * @param {Event} event
   */

  callToggleCallback(event) {
    event.stopPropagation();
    this.#toggleCallback();
  }

  giveFocus() {
    this.#checkbox.focus();
  }
  isFocused() {
    return document.activeElement === this.#checkbox;
  }
  setTabIndex(value) {
    this.#checkbox.setAttribute('tabindex', value);
  }

  setReadOnly() {
    super.setReadOnly();
    this.#checkbox.disabled = true;
  }

  setDisabled() {
    super.setDisabled();
    this.#checkbox.disabled = true;
  }

  setEnabled() {
    super.setEnabled();
    this.#checkbox.disabled = false;
  }

  isChecked() {
    return this.#checkbox.checked;
  }

  setChecked(checked) {
    this.#checkbox.checked = checked;
  }

}

export default CheckBoxView;