'use strict';

import NodeElement from './NodeElement.js';

class Component extends NodeElement {

  /**
   * Constructeur
   * @param {View} view - objet donnant l'affichage du composant. Peut définir plusieurs affichages
   */
  constructor(view) {
    super(view);
  }

  createView(htmlText) {
    super.createView(htmlText);
  }

}

export default Component;