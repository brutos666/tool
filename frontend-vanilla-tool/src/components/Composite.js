'use strict';

import NodeElement from './NodeElement.js';
import CompositeView from './views/CompositeView.js';

/**
 * Cette classe représente un composant qui peut avoir plusieurs enfants. L'espace dédié à l'ajout d'enfants est identifié par l'attribut id="spaceChildren"
 */
class Composite extends NodeElement {

  #children = [];
  /**
   * Constructeur
   * @param {CompositeView} view - objet donnant l'affichage du composant. Peut définir plusieurs affichages
   */
  constructor(view) {
    super(view === undefined ? new CompositeView() : view);
  }

  getSpaceChildren() {
    return this.getView()
      .getSpaceChildren();
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
    this.getView()
      .addView(element.getView());
  }

  replaceChild(elementToRemove, elementToAdd) {
    const index = this.#children.indexOf(elementToRemove);

    this.#children[index] = elementToAdd;
    this.getView()
      .replaceView(elementToAdd.getView(), elementToRemove.getView());
  }

  removeChild(element) {
    const index = this.#children.indexOf(element);

    if (index !== -1) {
      this.#children.splice(index, 1);
      this.getView()
        .removeView(element.getView());
    }
  }

  removeAllChildren() {
    this.#children = [];
    this.getView()
      .removeAllViews();
  }

}

export default Composite;