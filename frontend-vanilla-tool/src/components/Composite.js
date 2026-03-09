'use strict';

import NodeElement from './NodeElement.js';

class Composite extends NodeElement {

  #spaceChildren;
  #children = [];

  constructor() {
    super({ id: 'childrenSpace' });
    // this.createView(String.raw`<div id="childrenSpace"></div>`);
  }

  createView(htmlText) {
    super.createView(htmlText);
    this.#spaceChildren = this.getNodeView()
      .querySelector('[id=\'childrenSpace\']');
  }

  getSpaceChildren() {
    return this.#spaceChildren;
  }

  getChildren() {
    return this.#children;
  }

  /**
   * Ajoute un enfant. La vue du composant est ajouté au DOM dans l'espace dédié (#spaceChildren)
   * @param {NodeElement} element : noeud
   */
  addChild(element) {
    this.#children.push(element);
    // Ajout au DOM
    this.#spaceChildren.appendChild(element.getNodeView());
  }

  removeAllChildren() {
    this.#children = [];
    this.#spaceChildren.innerHTML = '';
  }

}

export default Composite;