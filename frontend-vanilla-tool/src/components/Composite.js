'use strict';

import NodeElement from './NodeElement.js';
import CompositeView from './views/CompositeView.js';

/**
 * Cette classe représente un composant qui peut avoir plusieurs enfants. L'espace dédié à l'ajout d'enfants est identifié par l'attribut id="spaceChildren"
 */
class Composite extends NodeElement {

  /** @type {NodeElement[]} */
  #children = [];
  /**
   * @constructor
   * @param {CompositeView} view - objet donnant l'affichage du composant. Peut définir plusieurs affichages
   */
  constructor(view) {
    super(view === undefined ? new CompositeView() : view);
  }

  /**
   * Retourne la liste des enfants
   * @returns {Array<NodeElement>} - liste des enfants
   */
  getChildren() {
    return this.#children;
  }

  setChildren(children) {
    this.#children = children;
    this.getView()
      .refreshView(children.map(child => child.getView()));
  }

  /**
   * Ajoute un enfant. La vue du composant est ajouté au DOM dans l'espace dédié (#spaceChildren)
   * @param {NodeElement} element : noeud
   */
  addChild(element) {
    this.#children.push(element);
    this.getView()
      .addView(element.getView());
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