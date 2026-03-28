'use strict';

import NodeElement from './NodeElement.js';

class Component extends NodeElement {

  /**
   * @constructor
   * @param {View} view - objet donnant l'affichage du composant. Peut gérer plusieurs affichages
   */
  constructor(view) {
    super(view);
  }

}

export default Component;