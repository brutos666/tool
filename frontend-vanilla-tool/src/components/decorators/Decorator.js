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

    this.#decoratedElement.removeFromParent = () => {
      this.removeFromParent();
    };
  }

  /**
   * Retourne l'élément auquel on a rajouté le décorateur
   * @returns {Component} composant décoré
   */
  getDecoratedElement() {
    return this.#decoratedElement;
  }

  /** @override */
  getOriginalElement() {
    let originalElement = this.getDecoratedElement();
    while (originalElement instanceof Decorator) {
      originalElement = originalElement.getDecoratedElement();
    }
    return originalElement;
  }

}
export default Decorator;