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

  destroy() {
    super.destroy();
    this.#decoratedElement.destroy();
  }

}
export default Decorator;