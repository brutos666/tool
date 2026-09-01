import View from './View.js';

class InputView extends View {

  name = 'InputView';

  static PASSWORD_ERROR = 'Les mots de passe ne correspondent pas, veuillez les saisir à nouveau.';

  #onInputEvent = this.undoError.bind(this);
  #inputComponent;
  #error;

  /**
   *
   * @param {Object} data
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du champ
   * @param {string} data.label - Label du champ
   * @param {string|undefined} data.icon - Icône du champ
   * @param {'text'|'password'|'email'} data.type - Type du champ
   * @param {string} data.placeHolder - PlaceHolder
   */
  constructor(data) {
    super(data);
    this.#inputComponent = this.getElementView()
      .querySelector('.input__component');
    this.#error = this.getElementView()
      .querySelector('.input__error');
    this.#inputComponent.addEventListener('input', this.#onInputEvent, false);
  }

  /**
   * @override {@link View.getHtmlView}
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du champ
   * @param {string} data.label - Label du champ
   * @param {'text'|'password'|'email'} data.type - Type du champ
   * @param {string} data.placeHolder - PlaceHolder
   * @returns {string} - Code HTML du champ
   */
  getHtmlView(data) {
    return String.raw`<div class="input">
          <label for="${ data.id }" class="input">
            <span class="input__label">${ data.label }</span>
            <input class="input__component" type="${ data.type }" id="${ data.id }" placeholder="${ data.placeHolder }">
            <span class="input__error" aria-live="polite"></span>
          </label>
        </div>`;
  }

  setRequired(required) {
    this.#inputComponent.required = required;
  }

  setInputAttribute(attribute, value) {
    this.#inputComponent.setAttribute(attribute, value);
  }
  removeInputAttribute(attribute) {
    this.#inputComponent.removeAttribute(attribute);
  }

  checkValidity() {
    /*
     * NOTE : documentation sur les contraintes de validation (06/2026)
     * https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-constraint-validation-api
     */
    const valid = this.#inputComponent.validity.valid;
    if (valid) {
      this.#error.innerHTML = '';
      this.#inputComponent.classList.remove('invalid');
      return true;
    }
    this.#error.innerHTML = this.#inputComponent.validationMessage;
    this.#inputComponent.classList.add('invalid');
    return false;
  }

  setCustomValidity(validationMessage) {
    // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#dom-cva-setcustomvalidity
    this.#inputComponent.setCustomValidity(validationMessage);
  }

  undoError() {
    this.setCustomValidity('');
    if (this.#inputComponent.validity.valid) {
      this.#error.innerHTML = '';
    }
  }

  getValue() {
    return this.#inputComponent.value;
  }

  clearValue() {
    this.#inputComponent.value = '';
  }

  destroy() {
    this.#inputComponent.removeEventListener('input', this.#onInputEvent, false);

    super.destroy();

    this.#error = null;
    this.#inputComponent = null;
    this.#onInputEvent = null;
  }

}
export default InputView;