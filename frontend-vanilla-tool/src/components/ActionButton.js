'use strict';

import Component from './Component.js';
import ActionButtonView from './views/ActionButtonView.js';
class ActionButton extends Component {

  /**
   * Constructeur de la classe Button
   * @param {object} data - Informations à stocker dans le bouton
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   */
  constructor(data) {
    super(new ActionButtonView(data.id, data.label));
  }

  setDoActionCallback(callback) {
    /** @type {ActionButtonView} */
    const actionView = this.getView();

    actionView.setDoActionCallback(callback);
  }

  changeLabel(label) {
    this.getView()
      .changeLabel(label);
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