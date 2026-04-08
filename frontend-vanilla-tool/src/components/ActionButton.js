'use strict';

import Component from './Component.js';
import ActionButtonView from './views/ActionButtonView.js';
class ActionButton extends Component {

  name = 'ActionButton';
  /**
   * @constructor de la classe Button
   * @param {object} data - Informations pour afficher le bouton
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   */
  constructor(data) {
    super(new ActionButtonView(data));
  }

  /**
   * @override
   * @returns {ActionButtonView}
   */
  getView() {
    return super.getView();
  }

  setDoActionCallback(callback) {
    this.getView()
      .setDoActionCallback(callback);
  }

}

export default ActionButton;