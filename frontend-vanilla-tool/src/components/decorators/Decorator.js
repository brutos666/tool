import Component from '../Component.js';
/** @import DecoratorView from './views/DecoratorView.js'; */

/**
 * NOTE : Il faut que le parent des décorateurs successifs soit le parent de l'élément décoré
 */
class Decorator extends Component {

  #decoratedElement;

  /**
   * @constructor
   * @param {DecoratorView} decoratorView
   * @param {Component} decoratedElement
   */
  constructor(decoratorView, decoratedElement) {
    super(decoratorView);
    this.#decoratedElement = decoratedElement;
  }

  /**
   * Retourne l'élément auquel on a rajouté le décorateur
   * @returns {Component} composant décoré
   */
  getDecoratedElement() {
    if (this.#decoratedElement instanceof Decorator) {
      return this.#decoratedElement.getDecoratedElement();
    }
    return this.#decoratedElement;
  }
  getDecoratedElementByName(name) {
    if (this.#decoratedElement.getName() === name) {
      return this.#decoratedElement;
    }
    if (this.#decoratedElement.getDecoratedElement) {
      return this.#decoratedElement.getDecoratedElementByName(name);
    }
    return null;
  }

  getImmediateDecoratedElement() {
    return this.#decoratedElement;
  }

  getFocusManager() {
    return this.#decoratedElement.getFocusManager();
  }

  setCurrent() {
    this.#decoratedElement.setCurrent();
  }
  removeCurrent() {
    this.#decoratedElement.removeCurrent();
  }

  destroy() {
    super.destroy();
    this.#decoratedElement.destroy();
  }

  added(parent) {
    super.added(parent);
    this.#decoratedElement.added(parent);
  }

  isDecorator() {
    return true;
  }

}
export default Decorator;