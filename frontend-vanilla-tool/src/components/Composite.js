'use strict';

import Component from './Component.js';
import CompositeView from './views/CompositeView.js';

/**
 * Cette classe représente un composant qui peut avoir plusieurs enfants. L'espace dédié à l'ajout d'enfants est identifié par l'attribut id="spaceChildren"
 */
class Composite extends Component {

  /** @type {Component[]} */
  #children = [];
  #isCompositeView;

  /** @type {Function} */
  #getNewChildCallback = () => { return new Component(); };

  /**
   * @constructor
   * @param {CompositeView} view - objet donnant l'affichage du composant. Peut définir plusieurs affichages
   */
  constructor(view) {
    super(view === undefined ? new CompositeView() : view);
    this.#isCompositeView = view instanceof CompositeView;
  }

  /**
   * Positionne la méthode appelée lors de la création du nouvel enfant "vide" à ajouter
   * @param {Function} callback
   */
  setGetNewChildCallback(callback) {
    this.#getNewChildCallback = callback;
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

  getLastChild() {
    if (this.getChildren().length > 0) {
      return this.getChildren()[this.getChildren().length - 1];
    }
    return null;
  }

  setChildren(children) {
    this.#children = children;

    if (this.#isCompositeView) {
      this.getView()
        .refreshViews(children.map(child => child.getView()));
    }

    children.forEach((/** @type {Component} */ child) => child.added(this));
  }

  /**
   * Ajoute un enfant. La vue du composant est ajouté au DOM dans l'espace dédié (#spaceChildren)
   * @param {Component} element : noeud
   * @returns {Component} l'élément ajouté
   */
  addChild(element) {
    this.#children.push(element);
    if (this.#isCompositeView) {
      this.getView()
        .addView(element.getView());
    }

    element.added(this);
    return element;
  }

  /**
   * Ajout un nouvel élément en appelant la méthode qui définit le composant "vide" à ajouter
   * @returns {Component} l'élément ajouté
   */
  addNewChild() {
    return this.addChild(this.#getNewChildCallback());
  }

  replaceChild(element, oldElement) {
    const index = this.#children.indexOf(oldElement);
    if (index === -1) {
      return;
    }
    this.#children[index] = element;
    if (this.#isCompositeView) {
      this.getView()
        .replaceView(element.getView(), oldElement.getView());
      oldElement.removed();
    }
    element.added(this);
  }

  removeChild(element) {
    const index = this.#children.indexOf(element);
    if (index === -1) {
      return;
    }
    this.#children.splice(index, 1);
    if (this.#isCompositeView) {
      this.getView()
        .removeView(element.getView());
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
    if (this.#isCompositeView) {
      this.getView()
        .removeAllViews();
    }
    this.#children = [];
  }

  isNode() {
    return true;
  }

}

export default Composite;