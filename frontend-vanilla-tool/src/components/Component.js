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
    this.getFocusManager()
      ?.setParentComponent(parent);
    this.getView()
      .added(parent.getView());
  }

  /**
   * Appelé lorsque le composant est retiré du parent
   */
  removed() {
    this.#parent = null;
    this.getFocusManager()
      ?.disableKeyNavigation();
    this.getView()
      .removed();
    this.destroy();
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