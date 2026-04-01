import Composite from '../Composite.js';
/** @import DecoratorView from './views/DecoratorView.js'; */

class Decorator extends Composite {

  #targetElement;
  /**
   * @constructor
   * @param {DecoratorView} decoratorView
   * @param {Component} element
   */
  constructor(decoratorView, element) {
    super(decoratorView);

    this.#targetElement = element;
  }

  getTargetElement() {
    return this.#targetElement;
  }

}

export default Decorator;