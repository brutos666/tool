import Component from './Component.js';
import InputView from './views/InputView.js';

class Input extends Component {

  name = 'Input';

  /**
   * @constructor de la classe
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du champ
   * @param {string} data.label - Label du champ
   * @param {string|undefined} data.icon - Icône du champ
   * @param {'text'|'email'|'password'} data.type - Type du champ
   * @param {string} data.placeHolder - PlaceHolder
   */
  constructor(data) {
    super(new InputView(data));
  }
  checkValidity() {
    return this.getView()
      .checkValidity();
  }
  setCustomValidity(validationMessage) {
    this.getView()
      .setCustomValidity(validationMessage);
  }

  getValue() {
    return this.getView()
      .getValue();
  }
  clearValue() {
    this.getView()
      .clearValue();
  }

}
export default Input;