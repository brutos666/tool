'use strict';

import Component from './Component.js';
import ActionButtonView from './views/ActionButtonView.js';
class ActionButton extends Component {

  /**
   * @constructor de la classe Button
   * @param {object} data - Informations pour afficher le bouton
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   */
  constructor(data) {
    super(new ActionButtonView(data));
  }

  setDoActionCallback(callback) {
    /** @type {ActionButtonView} */
    const actionView = this.getView();

    actionView.setDoActionCallback(callback);
  }

  setDisabled() {
    this.getView()
      .setDisabled();
  }

  setEnabled() {
    this.getView()
      .setEnabled();
  }

}

export default ActionButton;