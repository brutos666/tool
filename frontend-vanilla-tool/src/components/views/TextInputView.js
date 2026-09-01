import View from './View.js';

class TextInputView extends View {

  #onInputEvent = this.callOnChangeCallback.bind(this);
  #onFocusEvent = this.enter.bind(this);
  #onBlurEvent = this.exit.bind(this);

  #onChangeCallback = () => {};

  constructor() {
    super();
    const elementView = this.getElementView();
    elementView.addEventListener('input', this.#onInputEvent);
    elementView.addEventListener('focus', this.#onFocusEvent, true);
    elementView.addEventListener('blur', this.#onBlurEvent, true);
  }

  /**
   * @override {@link View.getHtmlView}
   */
  getHtmlView() {
    return String.raw`<div contenteditable="true" property="text" role="textbox" aria-multiline="true"></div>`;
  }

  setOnChangeCallback(callback) {
    this.#onChangeCallback = callback;
  }

  getOnChangeCallback() {
    return this.#onChangeCallback;
  }

  callOnChangeCallback(event) {
    this.#onChangeCallback(event);
  }

  enter() {
    this.getElementView().innerText = this.getElementView().innerHTML;
  }
  exit() {
    this.getElementView().innerHTML = this.getElementView().innerText;
  }

  getValue() {
    return this.getElementView().innerText;
  }

  setValue(value) {
    this.getElementView().innerHTML = value;
    // TODO DOMPurify.sanitize(value);
  }

  setDisabled() {
    super.setDisabled();
    this.getElementView().contentEditable = false;
  }

  setEnabled() {
    super.setEnabled();
    this.getElementView().contentEditable = true;
  }

  /** @override */
  destroy() {
    const elementView = this.getElementView();
    elementView.removeEventListener('input', this.#onInputEvent);
    elementView.removeEventListener('focus', this.#onFocusEvent, true);
    elementView.removeEventListener('blur', this.#onBlurEvent, true);

    super.destroy();
  }

}
export default TextInputView;