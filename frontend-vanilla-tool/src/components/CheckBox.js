import Component from './Component.js';
import CheckBoxView from './views/CheckBoxView.js';

class CheckBox extends Component {

  name = 'CheckBox';
  /**
   * @constructor de la classe
   * @param {object} data - Informations pour afficher le bouton
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   * @param {string} data.role - Rôle du bouton
   */
  constructor(data) {
    super(new CheckBoxView(data));
  }
  setToggleCallback(callback) {
    /** @type {CheckBoxView} */
    const view = this.getView();
    view.setToggleCallback(callback);
  }

}

export default CheckBox;