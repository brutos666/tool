'use strict';

import Component from './Component.js';
import CompositeView from './views/CompositeView.js';

/**
 * Cette classe représente un composant qui peut avoir plusieurs enfants. L'espace dédié à l'ajout d'enfants est identifié par l'attribut id="spaceChildren"
 */
class Composite extends Component {

  /** @type {Component[]} */
  #children = [];

  /**
   * @constructor
   * @param {CompositeView} view - objet donnant l'affichage du composant. Peut définir plusieurs affichages
   */
  constructor(view) {
    super(view === undefined ? new CompositeView() : view);
  }

  /**
   * @override
   * @returns {CompositeView}
   */
  getView() {
    return super.getView();
  }

  /**
   * Retourne la liste des enfants
   * @returns {Array<Component>} - liste des enfants
   */
  getChildren() {
    return this.#children;
  }

  /**
   * Ajoute un enfant. La vue du composant est ajouté au DOM dans l'espace dédié (#spaceChildren)
   * @param {Component} element : noeud
   * @returns {Component} l'élément ajouté
   */
  addChild(element) {
    /** @type {CompositeView} */
    const view = this.getView();
    this.#children.push(element);
    if (view.isNode()) {
      view.addView(element.getView());
    }

    element.added(this);
    return element;
  }

  replaceChild(element, oldElement) {
    const index = this.#children.indexOf(oldElement);
    if (index === -1) {
      return;
    }
    /** @type {CompositeView} */
    const view = this.getView();
    this.#children[index] = element;
    if (view.isNode()) {
      view.replaceView(element.getView(), oldElement.getView());
      oldElement.removed();
    }
    element.added(this);
  }

  removeChild(element) {
    const index = this.#children.indexOf(element);
    if (index === -1) {
      return;
    }
    /** @type {CompositeView} */
    const view = this.getView();
    this.#children.splice(index, 1);
    if (view.isNode()) {
      view.removeView(element.getView());
    }
    element.removed();
  }

  removeAllChildren() {
    this.#children.forEach((/** @type {Component} */ child) => {
      child.removed();
      if (child.isNode()) {
        child.removeAllChildren();
      }
    });
    /** @type {CompositeView} */
    const view = this.getView();
    if (view.isNode()) {
      view.removeAllViews();
    }
    this.#children = [];
  }

  isNode() {
    return true;
  }

}

export default Composite;