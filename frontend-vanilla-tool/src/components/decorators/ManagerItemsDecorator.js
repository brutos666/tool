import ManagerItemsDecoratorView from './views/ManagerItemsDecoratorView.js';
import Decorator from './Decorator.js';
import Item from '../Item.js';
import AddItemButton from '../AddItemButton.js';

/**
 * Cette classe s'occupe de modifier l'item courant dans l'espace qu'elle décore.
 * Sa vue s'occupe des touches de navigation et de la prise de focus
 */
class ManagerItemsDecorator extends Decorator {

  name = 'ManagerItemsDecorator';

  /** @type {Item} */
  #currentItem = null;
  /** @type {Item} */
  #focusItem = null;

  constructor(view) {
    super(new ManagerItemsDecoratorView(view), view);
    // Écoute la prise de focus d'un item afin de modifier l'item qui devient courant
    this.getDecoratedElement()
      .getView()
      .addEventListener(Item.EVENTS.focus, this.onItemFocus.bind(this));
    this.getDecoratedElement()
      .getView()
      .addEventListener(AddItemButton.EVENTS.focus, this.onItemFocus.bind(this));

    this.getView()
      .setMakeCurrentCallback(() => {
        if (this.#currentItem && this.#currentItem === this.#focusItem || !this.#focusItem) {
          return;
        }
        this.setCurrentItem(this.#focusItem);
      });
  }

  setTreeItem(treeItem) {
    this.getDecoratedElement()
      .setTreeItem(treeItem);
  }

  onItemFocus(event) {
    if (this.#focusItem && this.#focusItem === event.detail) {
      return;
    }
    /** @type {Item|AddItemButton} */
    const item = event.detail;
    if (this.#focusItem?.setEditable) {
      // Sortie du mode édition de l'item précédent (s'il ne s'agit pas d'un simple bouton d'ajout d'item)
      this.#focusItem.setEditable(false);
    }
    this.#focusItem = item;
    this.getView()
      .setFocusItemView(item.getView());
  }

  /**
   * Positionner le nouvel item courant
   * @param {Item} item
   */
  setCurrentItem(item) {
    this.#currentItem?.removeCurrent();
    this.#currentItem = item;
    this.#currentItem.setCurrent();
    this.getView()
      .setCurrentItemView(item.getView());
  }

}

export default ManagerItemsDecorator;