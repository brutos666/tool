import Component from './Component.js';
import TextInputView from './views/TextInputView.js';

class TextInput extends Component {

  /**
   * @constructor
   */
  constructor() {
    super(new TextInputView());
  }
  setOnChangeCallback(callback) {
    /** @type {TextInputView} */
    const view = this.getView();
    view.setOnChangeCallback(callback);
  }

  getValue() {
    /** @type {TextInputView} */
    const view = this.getView();
    return view.getValue();
  }

  setValue(value) {
    /** @type {TextInputView} */
    const view = this.getView();
    view.setValue(value);
  }

}

export default TextInput;