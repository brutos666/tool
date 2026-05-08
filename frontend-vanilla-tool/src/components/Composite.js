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

  getLastChild() {
    return this.#children[this.#children.length - 1];
  }

  getPreviousChild(child) {
    const index = this.#children.indexOf(child);
    if (index === -1) {
      return null;
    }
    return this.#children[index - 1];
  }

  getNextChild(child) {
    const index = this.#children.indexOf(child);
    if (index === -1) {
      return null;
    }
    return this.#children[index + 1];
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
    if (view.isComposite()) {
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
    if (view.isComposite()) {
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
    if (view.isComposite()) {
      view.removeView(element.getView());
    }
    element.removed();
  }

  removeAllChildren() {
    this.#children.forEach((/** @type {Component} */ child) => {
      child.removed();
      if (child.isComposite()) {
        child.removeAllChildren();
      }
    });
    /** @type {CompositeView} */
    const view = this.getView();
    if (view.isComposite()) {
      view.removeAllViews();
    }
    this.#children = [];
  }

  isComposite() {
    return true;
  }
  setReadOnly() {
    super.setReadOnly();
    // Rendre tous les enfants en lecture seule
    this.getChildren()
      .forEach(child => child.setReadOnly());
  }

  setDisabled() {
    super.setDisabled();
    // Rendre tous les enfants en lecture seule
    this.getChildren()
      .forEach(child => child.setDisabled());
  }

  setEnabled() {
    super.setEnabled();
    // Rendre tous les enfants en lecture seule
    this.getChildren()
      .forEach(child => child.setEnabled());
  }

}

export default Composite;