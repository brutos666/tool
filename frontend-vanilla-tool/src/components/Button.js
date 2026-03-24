'use strict';

import Component from './Component.js';
class Button extends Component {

  constructor(data) {
    super(data);
    this.createView(String.raw`<button id="${ data.id }">${ data.label }</button>`);
    this.getNodeView()
      .addEventListener('click', data.onClick.bind(this));
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
    this.getNodeView().innerHTML = label;
  }

}

export default Button;