import View from './View.js';

class ActionButtonView extends View {

  #doActionCallback;

  constructor(id, label) {
    super();
    this.createView(String.raw`<button id="${ id }">${ label }</button>`);
    this.getElementView()
      .addEventListener('click', this.callDoActionCallback.bind(this));
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

  changeLabel(label) {
    this.getElementView().innerHTML = label;
  }

  setDisabled() {
    this.getElementView().classList.add('disabled');
  }

  setEnabled() {
    this.getElementView().classList.remove('disabled');
  }

}
export default ActionButtonView;