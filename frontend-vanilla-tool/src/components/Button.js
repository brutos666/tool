'use strict';

import Component from './Component.js';
class Button extends Component {

  #clickFunction;

  /**
   * Constructeur de la classe Button
   * @param {object} data - Informations à stocker dans le bouton
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   */
  constructor(data) {
    super();
    this.createView(String.raw`<button id="${ data.id }">${ data.label }</button>`);
  }

  setOnclickEvent(callback) {
    this.getElementView()
      .removeEventListener('click', this.#clickFunction);
    this.#clickFunction = callback.bind(this);
    this.getElementView()
      .addEventListener('click', this.#clickFunction);
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