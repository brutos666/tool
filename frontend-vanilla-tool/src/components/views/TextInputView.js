import View from './View.js';

class TextInputView extends View {

  #onChangeCallback = () => {};

  constructor() {
    super();
    this.getElementView()
      .addEventListener('input', this.callOnChangeCallback.bind(this));
    this.getElementView()
      .addEventListener('focus', this.enter.bind(this), true);
    this.getElementView()
      .addEventListener('blur', this.exit.bind(this), false);
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
    this.getElementView().textContent = this.getElementView().innerHTML;
  }
  exit() {
    this.getElementView().innerHTML = this.getElementView().textContent;
  }

  getValue() {
    return this.getElementView().textContent;
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

}
export default TextInputView;