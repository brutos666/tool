import ManagerItemsDecoratorView from './views/ManagerItemsDecoratorView.js';
import Decorator from './Decorator.js';
import Item from '../Item.js';

/**
 * Cette classe s'occupe de modifier l'item courant dans l'espace qu'elle décore
 */
class ManagerItemsDecorator extends Decorator {

  name = 'ManagerItemsDecorator';

  /** @type {Item} */
  #currentItem = null;

  constructor(view) {
    super(new ManagerItemsDecoratorView(view), view);
    // Écoute la prise de focus d'un item afin de modifier l'item qui devient courant
    this.getDecoratedElement()
      .getView()
      .addEventListener(Item.EVENTS.focus, event => {
        if (this.#currentItem && this.#currentItem === event.detail) {
          return;
        }
        this.#currentItem?.removeCurrent();
        /** @type {Item} */
        const item = event.detail;
        this.#currentItem = item;
        this.#currentItem.setCurrent();
      });
  }

}

export default ManagerItemsDecorator;