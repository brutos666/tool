'use strict';

import NodeElement from './NodeElement.js';
/** @import Composite from './Composite.js' */

class Component extends NodeElement {

  /** @type {Composite} */
  #parent;
  /**
   * @type {Object.<string, Component>}
   */
  #staticChildren = {};

  /**
   * @constructor
   * @param {View} view - objet donnant l'affichage du composant. Peut gérer plusieurs affichages
   */
  constructor(view) {
    super(view);
  }

  /**
   * Ajoute un enfant statique
   * @param {String} id
   * @param {Component} child
   */
  setStaticChild(id, child) {
    this.#staticChildren[id] = child;
    this.getView()
      .setStaticView(id, child.getView());
  }
  getStaticChild(id) {
    return this.#staticChildren[id];
  }

  /**
   * Appelé lorsque le composant est ajouté au parent
   * @param {Composite} parent - le parent du composant
   */
  added(parent) {
    this.#parent = parent;
  }
  /**
   * Appelé lorsque le composant est retiré du parent
   */
  removed() {
    this.#parent = null;
  }
  getPrevious() {
    const index = this.#parent.getChildren()
      .indexOf(this);
    if (index === 0) {
      return null;
    }
    return this.#parent.getChildren()[index - 1];
  }
  /**
   * Retire le composant du parent
   */
  doRemoveFromParent() {
    this.#parent.removeChild(this);
  }

  setDisabled() {
    this.getView()
      .setDisabled();
  }

  setEnabled() {
    this.getView()
      .setEnabled();
  }

  isNode() {
    return false;
  }

}

export default Component;