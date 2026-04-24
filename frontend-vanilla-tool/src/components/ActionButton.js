'use strict';

import Action from './Action.js';
import ActionButtonView from './views/ActionButtonView.js';
class ActionButton extends Action {

  name = 'ActionButton';
  /**
   * @constructor de la classe Button
   * @param {object} data - Informations pour afficher le bouton
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   * @param {string} data.role - Rôle du bouton
   */
  constructor(data) {
    super(new ActionButtonView(data));
  }

}

export default ActionButton;