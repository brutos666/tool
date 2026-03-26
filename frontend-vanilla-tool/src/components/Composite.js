'use strict';

import NodeElement from './NodeElement.js';

/**
 * Cette classe représente un composant qui peut avoir plusieurs enfants. L'espace dédié à l'ajout d'enfants est identifié par l'attribut id="spaceChildren"
 */
class Composite extends NodeElement {

  #spaceChildren;
  #children = [];

  constructor() {
    super();
    // this.createView(String.raw`<div></div>`);
  }

  /**
   * Création de la vue du composant
   * @param {string} htmlText - Code HTML du composant. Identifier l'espace dédié aux enfants du composant par l'attribut id="spaceChildren"
   */
  createView(htmlText) {
    super.createView(htmlText);
    const spaceChildren = this.getNodeView()
      .querySelector('[id=\'spaceChildren\']');

    if (spaceChildren) {
      this.#spaceChildren = spaceChildren;
    } else {
      this.#spaceChildren = this.getNodeView();
      this.#spaceChildren.setAttribute('id', 'spaceChildren');
    }
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

  replaceChild(elementToRemove, elementToAdd) {
    const index = this.#children.indexOf(elementToRemove);

    this.#children[index] = elementToAdd;
    this.#spaceChildren.replaceChild(elementToAdd.getNodeView(), elementToRemove.getNodeView());
  }

  removeChild(element) {
    const index = this.#children.indexOf(element);

    if (index !== -1) {
      this.#children.splice(index, 1);
      this.#spaceChildren.removeChild(element.getNodeView());
    }
  }

  removeAllChildren() {
    this.#children = [];
    this.#spaceChildren.innerHTML = '';
  }

  getChildById(idElement) {
    return this.#children.find(child => child.getNodeView()
      .querySelector(`[id='${ idElement }']`));
  }

}

export default Composite;