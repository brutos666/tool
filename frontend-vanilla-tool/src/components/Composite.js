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
   * Retourne la liste des enfants
   * @returns {Array<Component>} - liste des enfants
   */
  getChildren() {
    return this.#children;
  }

  getLastChild() {
    if (this.getChildren().length > 0) {
      return this.getChildren()[this.getChildren().length - 1];
    }
    return null;
  }

  setChildren(children) {
    this.#children = children;

    /** @type {CompositeView} */
    const compositeView = this.getView();
    compositeView.refreshViews(children.map(child => child.getView()));

    children.forEach((/** @type {Component} */ child) => child.added(this));
  }

  /**
   * Ajoute un enfant. La vue du composant est ajouté au DOM dans l'espace dédié (#spaceChildren)
   * @param {Component} element : noeud
   */
  addChild(element) {
    this.#children.push(element);
    /** @type {CompositeView} */
    const compositeView = this.getView();
    compositeView
      .addView(element.getView());

    element.added(this);
  }

  replaceChild(element, oldElement) {
    const index = this.#children.indexOf(oldElement);
    if (index === -1) {
      return;
    }
    this.#children[index] = element;
    this.getView()
      .removeView(oldElement.getView());
    oldElement.removed();
    this.getView()
      .addView(element.getView());
    element.added(this);
  }

  removeChild(element) {
    const index = this.#children.indexOf(element);
    if (index === -1) {
      return;
    }
    this.#children.splice(index, 1);
    this.getView()
      .removeView(element.getView());
    element.removed();
  }

  removeAllChildren() {
    this.#children.forEach((/** @type {Component} */ child) => {
      child.removed();
      if (child.isNode()) {
        child.removeAllChildren();
      }
    });
    this.getView()
      .removeAllViews();
    this.#children = [];
  }

  isNode() {
    return true;
  }

}

export default Composite;