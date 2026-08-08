import View from './View.js';

class TextInputView extends View {

  #onChangeCallback = () => {};

  constructor() {
    super();
    this.getElementView()
      .addEventListener('input', this.callOnChangeCallback.bind(this));
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

  getValue() {
    return this.getElementView().innerHTML;
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