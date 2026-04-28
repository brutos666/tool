import Decorator from './Decorator.js';
import ButtonDialogView from './views/ButtonDialogView.js';

class ButtonDialog extends Decorator {

  name = 'ButtonDialog';

  /**
   * @constructor
   * @param {object} decoratedElement - Element décoré
   * @param {object} data - Informations pour afficher le bouton
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   * @param {string} data.icon - Icône du bouton
   * @param {string} data.role - Rôle du bouton
   * @param {icon|menu|label} data.type - Type de bouton
   */
  constructor(decoratedElement, data) {
    super(new ButtonDialogView(decoratedElement.getView(), data), decoratedElement);
  }

}

export default ButtonDialog;