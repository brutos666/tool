import AddItemButton from '../AddItemButton.js';
import Item from '../Item.js';
import Decorator from './Decorator.js';
import ItemsKeyboardNavDecoratorView from './views/ItemsKeyboardNavDecoratorView.js';

/**
 * Cette classe s'occupe de modifier l'item courant dans l'espace qu'elle décore.
 * Sa vue s'occupe des touches de navigation et de la prise de focus
 */
class ItemsKeyboardNavDecorator extends Decorator {

  name = 'ItemsKeyboardNavDecorator';

  /** @type {Item} */
  #currentItem = null;
  /** @type {Item} */
  #focusItem = null;

  constructor(decoratedElement) {
    super(new ItemsKeyboardNavDecoratorView(decoratedElement.getView()), decoratedElement);
    // Écoute la prise de focus d'un item afin de modifier l'item qui devient courant
    decoratedElement.getView()
      .addEventListener(Item.EVENTS.focus, this.onItemFocus.bind(this));
    decoratedElement.getView()
      .addEventListener(AddItemButton.EVENTS.focus, this.onItemFocus.bind(this));
    decoratedElement.getView()
      .addEventListener(Item.EVENTS.current, event => {
        this.setCurrentItem(event.detail);
      });

    this.getView()
      .setMakeCurrentCallback(() => {
        if (this.#currentItem && this.#currentItem === this.#focusItem || !this.#focusItem) {
          return;
        }
        this.#focusItem.setCurrent();
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
    this.getView()
      .setCurrentItemView(item?.getView());
  }

}

export default ItemsKeyboardNavDecorator;