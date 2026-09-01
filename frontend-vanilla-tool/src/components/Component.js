'use strict';

import NodeElement from './NodeElement.js';
/** @import Composite from './Composite.js' */

class Component extends NodeElement {

  /** @type {Composite} */
  #parent;

  /**
   * @constructor
   * @param {View} view - objet donnant l'affichage du composant. Peut gérer plusieurs affichages
   */
  constructor(view) {
    super(view);
  }

  /**
   * Appelé lorsque le composant est ajouté au parent
   * @param {Composite} parent - le parent du composant
   */
  added(parent) {
    this.#parent = parent;
    const focusManager = this.getFocusManager();
    if (focusManager) {
      focusManager.setParentComponent(parent);
    }
    this.getView()
      .added(parent.getView());
  }

  /**
   * Appelé lorsque le composant est retiré du parent
   */
  removed() {
    super.removed();

    this.#parent = null;
  }

  /**
   * Récupère le parent
   * @returns {Composite}
   */
  getParent() {
    return this.#parent;
  }

  isComposite() {
    return false;
  }

  isDecorator() {
    return false;
  }

}

export default Component;