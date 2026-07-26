import StoreData from '../../../data/StoreData.js';
import TreeUtilities from '../../../tools/TreeUtilities.js';
import ClassDecoratorView from './ClassDecoratorView.js';
/** @import ItemView from '../../views/ItemView.js'; */
/** @import View from '../../views/View.js'; */

/**
 * Cette classe s'occupe de la navigation entre les items
 * Lorsque le focus est sur l'espace contenant les items, il faut taper entrer pour se positionner sur le premier item
 * afin de pouvoir naviguer dans les items. Échap pour en sortir.
 * Sur le même principe, lorsque l'on est positionné sur un item, il faut taper sur Entrée pour passer en mode édition et pouvoir naviguer dans les zones de texte et les boutons. Échap pour en sortir.
 * TODO : il me semble qu'une fois entré dans un espace permettant la navigation avec la tabulation, il faudrait y rester tant que l'on n'a pas fait echap. Ce n'est pas le cas dans un item. Le truc qui peut être aussi déroutant, c'est que la navigation dans un arbre de fait avec les flèches, tandis que la navigation dans un item se fait avec la tabulation.
 * TODO : Trouver de la documentation sur le Net avant de faire les modifications
 */
class ItemsKeyboardNavDecoratorView extends ClassDecoratorView {

  name = 'ItemsKeyboardNavDecoratorView';

  #focusedItem;
  /** @type {ItemView} */
  #currentItemView;
  /** @type {ItemView} */
  #focusItemView;

  #itemsNavigationSpace = null;

  #setMakeCurrentCallback = () => {};

  #keyEvent = {
    Enter: this.onKeyEnter.bind(this),
    Escape: this.onKeyEscape.bind(this),
    ArrowUp: this.onKeyArrowUp.bind(this),
    ArrowDown: this.onKeyArrowDown.bind(this),
    ArrowLeft: this.onKeyArrowLeft.bind(this),
    ArrowRight: this.onKeyArrowRight.bind(this),
    Home: this.onKeyHome.bind(this),
    End: this.onKeyEnd.bind(this)
  };

  /**
   * @constructor
   * @param {View} view
   */
  constructor(view) {
    super(view, 'manager-items--decorator');
    const decoratedElementView = this.getDecoratedView()
      .getElementView();
    this.#itemsNavigationSpace = decoratedElementView;
    decoratedElementView.addEventListener('keydown', this.onKeyDown.bind(this));
    decoratedElementView.addEventListener('mousedown', this.onMouseDown.bind(this));
    decoratedElementView.addEventListener('focusout', this.onFocusOut.bind(this));
    decoratedElementView.setAttribute('tabindex', '0');
  }

  setMakeCurrentCallback(callback) {
    this.#setMakeCurrentCallback = callback;
  }

  onFocusOut(event) {
    const item = event.target.closest('.item, .item-like-button');
    if (item?.contains(event.relatedTarget)) {
      return;
    }
    if (this.#focusItemView?.isEditable?.()) {
      this.#focusItemView.setEditable(false);
    }
  }

  setCurrentItemView(itemView) {
    this.#currentItemView = itemView;
  }
  setFocusItemView(itemView) {
    this.#focusItemView = itemView;
    this.setFocusItem(this.#focusItemView.getElementView());
  }

  /**
   * Click sur le bouton de la souris
   * @param {Event} event
   */
  onMouseDown(event) {
    const itemArticle = event.target.closest('.item .item__article');
    if (!itemArticle) {
      return;
    }
    const item = itemArticle.closest('.item');
    this.setFocusItem(item);
    this.#setMakeCurrentCallback();
    if (this.#currentItemView) {
      this.#currentItemView.setEditable(true);
      this.#currentItemView.giveFocus();
    }
  }
  /**
   * Méthode appelée lors de l'appui sur une touche de clavier
   * @param {Event} event - Event de clavier
   */
  onKeyDown(event) {
    const dragDropMode = StoreData.getDragDropCenter()
      .isDragDropMode();
    if (dragDropMode || !this.interceptKeys()
      .includes(event.key)) {
      return;
    }
    event.preventDefault();
    this.#keyEvent[event.key]?.(event);
  }

  onKeyHome() {
    this.focusToFirst();
  }
  onKeyEnd() {
    this.focusToLast();
  }
  onKeyArrowDown() {
    this.focusToDirection('Down');
  }
  onKeyArrowUp() {
    this.focusToDirection('Up');
  }

  onKeyArrowRight() {
    if (TreeUtilities.isTreeElement(this.#focusedItem)) {
      if (TreeUtilities.isClosed(this.#focusedItem)) {
        TreeUtilities.openNode(this.#focusedItem);
      } else if (TreeUtilities.isOpened(this.#focusedItem)) {
        this.focusToDirection('Down');
      }
    } else {
      this.focusToDirection('Right');
    }
  }

  onKeyArrowLeft() {
    if (TreeUtilities.isTreeElement(this.#focusedItem)) {
      if (TreeUtilities.isOpened(this.#focusedItem)) {
        TreeUtilities.closeNode(this.#focusedItem);
      } else {
        this.focusToParent();
      }
    } else {
      this.focusToDirection('Left');
    }
  }
  onKeyEnter() {
    if (document.activeElement === this.#itemsNavigationSpace) {
      this.setModeNavigation(true);
      return;
    }
    if (this.#currentItemView === this.#focusItemView) {
      this.setModeEdition(true);
      return;
    }
    this.#setMakeCurrentCallback();
  }

  onKeyEscape() {
    if (this.#focusItemView?.isEditable?.()) {
      // On est passé en mode édition dans l'item. Il faut pouvoir naviguer dans les zones de texte et les boutons de l'item
      this.setModeEdition(false);
      return;
    }
    // Sortie du mode navigation
    this.setModeNavigation(false);
  }

  interceptKeys() {
    if (document.activeElement === this.#itemsNavigationSpace) {
      return ['Enter'];
    }
    if (this.#focusItemView?.isEditable?.()) {
      return ['Escape'];
    }
    if (isItemButtonLike(this.#focusedItem)) {
      return [ 'ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End' ];
    }
    return [ 'ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End', 'Enter', 'Escape' ];
  }

  setModeNavigation(on) {
    let description;
    if (on) {
      description = 'Navigation active. Échap pour quitter.';
      this.focusToFirst();
    } else {
      description = 'Entrée pour activer la navigation.';
      this.#itemsNavigationSpace.focus();
    }
    this.#itemsNavigationSpace.setAttribute('aria-description', description);
  }
  setModeEdition(on) {
    this.#currentItemView.setEditable(on);
    this.#currentItemView.giveFocus();
  }

  focusToDirection(direction) {
    if (isTableItem(this.#focusedItem)) {
      this.focusTableToDirection(direction);
      return;
    }
    const items = this.getItems();
    const idx = items.indexOf(this.#focusedItem);
    let indexToFocus = idx;
    switch (direction) {
      case 'Down':
        indexToFocus = idx + 1;
        break;
      case 'Up':
        indexToFocus = idx - 1;
        break;
    }
    if (!isOutOfRange(items, indexToFocus)) {
      this.setFocusItem(items[indexToFocus]);
    }
  }
  focusTableToDirection(direction) {
    let items;
    /** @type {HTMLTableCellElement} */
    const cell = this.#focusedItem.closest('th, td');
    const currentColumnItems = getColumnItems(this.getElementView(), cell.cellIndex);
    const currentColumnIndex = currentColumnItems.indexOf(this.#focusedItem);
    let indexToFocus = -1;
    switch (direction) {
      case 'Down':
        items = currentColumnItems;
        indexToFocus = currentColumnIndex + 1;
        break;
      case 'Up':
        items = currentColumnItems;
        indexToFocus = currentColumnIndex - 1;
        break;
      case 'Right':
        items = getColumnItems(this.getElementView(), cell.cellIndex + 1);
        indexToFocus = giveNewColumnIndex(currentColumnIndex, items);
        break;
      case 'Left':
        items = getColumnItems(this.getElementView(), cell.cellIndex - 1);
        indexToFocus = giveNewColumnIndex(currentColumnIndex, items);
        break;
    }
    if (!isOutOfRange(items, indexToFocus)) {
      this.setFocusItem(items[indexToFocus]);
    }
  }
  focusToParent() {
    const parent = TreeUtilities.getParent(this.#focusedItem);
    if (parent) {
      this.setFocusItem(parent);
    }
  }
  focusToFirst() {
    const items = this.getItems();
    this.setFocusItem(items[0]);
  }
  focusToLast() {
    const items = this.getItems();
    this.setFocusItem(items[items.length - 1]);
  }
  setFocusItem(item) {
    this.#focusedItem = item;
    item.focus();
  }

  getItems() {
    const allElements = [
      ...this.getElementView()
        .querySelectorAll('.item, .item-like-button')
    ];
    return TreeUtilities.filterVisibleElements(allElements);
  }

}

/**
 * Vérifier si l'index est hors des limites de l'array
 * @param {Array} array
 * @param {number} index
 */
function isOutOfRange(array, index) {
  return index < 0 || index >= array.length;
}
/**
 * Vérifier si l'item se trouve dans une table
 * @param {HTMLElement} item
 */
function isTableItem(item) {
  return item.closest('th, td') !== null;
}
/**
 * Vérifier si l'item est un bouton
 * @param {HTMLElement} item
 */
function isItemButtonLike(item) {
  return item.classList.contains('item-like-button');
}

/**
 * Récupérer tous les items d'une colonne
 * @param {HTMLTableElement} tableElement
 * @param {number} indexColumn
 * @returns {Array<HTMLElement>}
 */
function getColumnItems(tableElement, indexColumn) {
  if (indexColumn < 0) {
    return [];
  }
  const array = [];
  // La 1ere ligne contient l'item story qui s'étend sur plusieurs colonnes
  array.push(tableElement.rows[0].querySelector('.item'));
  // Ajout de tous les items se trouvant dans la cellule des lignes suivantes
  for (let i = 1; i < tableElement.rows.length; i++) {
    array.push(...tableElement.rows[i].cells[indexColumn].querySelectorAll('.item, .item-like-button'));
  }
  return array;
}
/**
 * Calcul l'index de l'item pour la nouvelle colonne en fonction de sa position dans la colonne courante
 * @param {number} currentItemIndex - Index de l'item courant
 * @param {Array<HTMLElement>} newColumnItems - Items de la nouvelle colonne
 */
function giveNewColumnIndex(currentItemIndex, newColumnItems) {
  if (currentItemIndex >= newColumnItems.length && newColumnItems.length > 1) {
    // On ne veut pas se positionner sur l'item story si on se déplace sur "Ajouter une règle"
    return newColumnItems.length - 1;
  }
  return currentItemIndex;
}

export default ItemsKeyboardNavDecoratorView;