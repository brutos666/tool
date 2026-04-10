'use strict';

import NodeElement from './NodeElement.js';
/** @import Composite from './Composite.js' */

class Component extends NodeElement {

  /** @type {Composite} */
  #parent;
  /** @type {{id: String, parent: Composite}} */
  #staticParent;

  /**
   * @constructor
   * @param {View} view - objet donnant l'affichage du composant. Peut gérer plusieurs affichages
   */
  constructor(view) {
    super(view);
  }

  getOriginalElement() {
    return this;
  }
  /** @override */
  setStaticChild(id, child) {
    super.setStaticChild(id, child);
    child.addedAsStatic(id, this);
  }

  /**
   * Appelé lorsque le composant est ajouté au parent
   * @param {Composite} parent - le parent du composant
   */
  added(parent) {
    this.#parent = parent;
  }
  addedAsStatic(id, parent) {
    this.#staticParent = { id, parent };
  }
  /**
   * Appelé lorsque le composant est retiré du parent
   */
  removed() {
    this.#parent = null;
  }

  /**
   * Retire le composant du parent
   */
  removeFromParent() {
    if (this.#staticParent) {
      this.#staticParent.parent.removeStaticChild(this.#staticParent.id);
      return;
    }
    this.getParent()
      .removeChild(this);
  }

  removeStaticChild(id) {
    this.getView()
      .removeStaticView(id);
  }
  /**
   * Récupère le parent
   * @returns {Composite}
   */
  getParent() {
    return this.#parent;
  }

  isNode() {
    return false;
  }

}

export default Component;