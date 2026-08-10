import Action from './Action.js';
import AddItemButtonView from './views/AddItemButtonView.js';

class AddItemButton extends Action {

  name = 'AddItemButton';

  /**
   * @constructor de la classe Button
   * @param {object} data - Informations pour afficher le bouton
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   */
  constructor(data) {
    super(new AddItemButtonView(data));
  }

}

export default AddItemButton;