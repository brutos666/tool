import Component from '../Component.js';
/** @import Composite from '../Composite.js'; */
/** @import DecoratorView from './views/DecoratorView.js'; */

class Decorator extends Component {

  #decoratedElement;
  #oldAddChild;
  #oldAddNewChild;
  #oldSetChildren;
  /**
   * @constructor
   * @param {DecoratorView} decoratorView
   * @param {Component} decoratedElement
   */
  constructor(decoratorView, decoratedElement) {
    super(decoratorView);

    this.#decoratedElement = decoratedElement;
    // Remplacer éventuellement le comportement au composant d'origine en permettant de réécrire les méthode de gestion des enfants
    if (decoratedElement.isNode()) {
      this.#oldAddChild = decoratedElement.addChild.bind(decoratedElement);
      decoratedElement.addChild = element => {
        this.addChild(element);
        // decoratedElement.addChild(element);
      };
      this.#oldAddNewChild = decoratedElement.addNewChild.bind(decoratedElement);
      decoratedElement.addNewChild = () => {
        this.addNewChild();
        // decoratedElement.addNewChild();
      };
      this.#oldSetChildren = decoratedElement.setChildren.bind(decoratedElement);
      decoratedElement.setChildren = children => {
        this.setChildren(children);
        // decoratedElement.setChildren(children);
      };
    }
  }

  /**
   * Retourne l'élément auquel on a rajouté le décorateur
   * @returns {Component} composant décoré
   */
  getDecoratedElement() {
    return this.#decoratedElement;
  }

  addChild(element) {
    this.#oldAddChild(element);
  }

  addNewChild() {
    this.#oldAddNewChild();
  }

  setChildren(children) {
    this.#oldSetChildren(children);
  }

}

export default Decorator;