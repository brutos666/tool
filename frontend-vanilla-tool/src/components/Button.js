'use strict';

import Component from './Component.js';
class Button extends Component {

  /**
   * Constructeur de la classe Button
   * @param {object} data - Informations à stocker dans le bouton
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   * @param {Function} data.onClickCallback - Fonction appelée lorsque le bouton est cliqué
   */
  constructor(data) {
    super();
    this.createView(String.raw`<button id="${ data.id }">${ data.label }</button>`);
    this.getElementView()
      .addEventListener('click', data.onClickCallback.bind(this));
  }

  /**
   * Affiche le bouton
   */
  showButton() {
    this.getNodeView().classList.remove('.hidden');
  }
  /**
   * Masque le bouton
   */
  hideButton() {
    this.getNodeView().classList.add('.hidden');
  }

  changeLabel(label) {
    this.getElementView().innerHTML = label;
  }
  setDisabled() {
    this.getElementView().classList.add('disabled');
  }

  setEnabled() {
    this.getElementView().classList.remove('disabled');
  }

}

export default Button;