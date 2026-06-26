import Action from './Action.js';
import SubmitButtonView from './views/SubmitButtonView.js';

class SubmitButton extends Action {

  name = 'SubmitButton';
  /**
   * @constructor de la classe Button
   * @param {object} data - Informations pour afficher le bouton
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   * @param {string} data.icon - Icône du bouton
   */
  constructor(data) {
    super(new SubmitButtonView(data));
  }

}
export default SubmitButton;