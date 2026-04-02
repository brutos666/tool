import Component from '../Component.js';
/** @import DecoratorView from './views/DecoratorView.js'; */

class Decorator extends Component {

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