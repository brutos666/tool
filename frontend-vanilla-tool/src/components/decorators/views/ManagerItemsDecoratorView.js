import DecoratorView from './DecoratorView.js';
/** @import ItemView from '../../views/ItemView.js'; */
/** @import View from '../../views/View.js'; */

/**
 * Cette classe s'occupe de la navigation entre les items
 * Lorsque le focus est sur l'espace contenant les items, il faut taper entrer pour se positionner sur le premier item
 * afin de pouvoir naviguer dans les items. Echap pour en sortir.
 * Sur le même principe, lorsque l'on est positionné sur un item, il faut taper sur Entrée pour passer en mode édition et pouvoir naviguer dans les zones de texte et les boutons. Echap pour en sortir.
 */
class ManagerItemsDecoratorView extends DecoratorView {

  name = 'ManagerItemsDecoratorView';

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
    super(view);
    const decoratedView = this.getDecoratedView();
    const decoratedElementView = decoratedView.getElementView();
    this.#itemsNavigationSpace = decoratedElementView.classList.contains('items-navigation__space')
      ? decoratedElementView
      : decoratedElementView.querySelector('.items-navigation__space');
    this.#itemsNavigationSpace.tabIndex = 0;
    decoratedElementView.addEventListener('keydown', this.onKeyDown.bind(this));
    decoratedElementView.addEventListener('mousedown', this.onMouseDown.bind(this));
    decoratedElementView.addEventListener('focusout', this.onFocusOut.bind(this));
  }

  getHtmlView() {
    return String.raw`<template id="decoratedSpace" class="manager-items--decorator"></template>`;
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
    this.#currentItemView.setEditable(true);
    this.#currentItemView.giveFocus();
  }
  /**
   * Méthode appelée lors de l'appui sur une touche de clavier
   * @param {Event} event - Event de clavier
   */
  onKeyDown(event) {
    if (!this.interceptKeys()
      .includes(event.key)) {
      return;
    }
    this.#keyEvent[event.key]?.(event);
  }

  onKeyHome(event) {
    event.preventDefault();
    this.focusToFirst();
  }
  onKeyEnd(event) {
    event.preventDefault();
    this.focusToLast();
  }
  onKeyArrowDown(event) {
    event.preventDefault();
    this.focusToDirection('Down');
  }
  onKeyArrowUp(event) {
    event.preventDefault();
    this.focusToDirection('Up');
  }

  onKeyArrowRight(event) {
    event.preventDefault();
    if (isTreeItem(this.#focusedItem)) {
      if (isClosed(this.#focusedItem)) {
        openNode(this.#focusedItem);
      } else if (isOpened(this.#focusedItem)) {
        this.focusToDirection('Down');
      }
    } else {
      this.focusToDirection('Right');
    }
  }

  onKeyArrowLeft(event) {
    event.preventDefault();
    if (isTreeItem(this.#focusedItem)) {
      if (isOpened(this.#focusedItem)) {
        closeNode(this.#focusedItem);
      } else {
        this.focusToParent();
      }
    } else {
      this.focusToDirection('Left');
    }
  }
  onKeyEnter(event) {
    if (event.key === 'Enter' && document.activeElement === this.#itemsNavigationSpace) {
      event.preventDefault();
      this.setModeNavigation(true);
      return;
    }
    if (this.#currentItemView === this.#focusItemView) {
      event.preventDefault();
      this.setModeEdition(true);
      return;
    }
    event.preventDefault();
    this.#setMakeCurrentCallback();
  }

  onKeyEscape(event) {
    if (this.#focusItemView?.isEditable?.()) {
      // On est passé en mode édition dans l'item. Il faut pouvoir naviguer dans les zones de texte et les boutons de l'item
      event.preventDefault();
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
    if (!document.activeElement.closest('.items-navigation__space')) {
      return [];
    }
    if (this.#focusItemView?.isEditable?.()) {
      return ['Escape'];
    }
    if (isItemButtonLike(this.#focusedItem)) {
      return [
        'ArrowDown',
        'ArrowUp',
        'ArrowRight',
        'ArrowLeft',
        'Home',
        'End'
      ];
    }
    return [
      'ArrowDown',
      'ArrowUp',
      'ArrowRight',
      'ArrowLeft',
      'Home',
      'End',
      'Enter',
      'Escape'
    ];
  }

  setModeNavigation(on) {
    let description;
    if (on) {
      this.focusToFirst();
      description = 'Navigation active. Echap pour quitter.';
    } else {
      // Redonner le focus sur la zone contenant les items
      this.#itemsNavigationSpace.focus();
      description = 'Entrée pour activer la navigation.';
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
    /** @type {HTMLTableRowElement} */
    const row = this.#focusedItem.closest('tr');
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
        indexToFocus = this.giveNewColumnIndex(currentColumnIndex, row.rowIndex, items);
        break;
      case 'Left':
        items = getColumnItems(this.getElementView(), cell.cellIndex - 1);
        indexToFocus = this.giveNewColumnIndex(currentColumnIndex, row.rowIndex, items);
        break;
    }
    if (!isOutOfRange(items, indexToFocus)) {
      this.setFocusItem(items[indexToFocus]);
    }
  }

  giveNewColumnIndex(currentItemIndex, currentRowIndex, newColumnItems) {
    if (currentItemIndex >= newColumnItems.length && newColumnItems.length > 1) {
      // On ne veut pas se positionner sur l'item story si on se déplace sur "Ajouter une règle"
      return newColumnItems.length - 1;
    }
    return currentItemIndex;
  }

  focusToParent() {
    const group = this.#focusedItem.closest('[role="group"]');
    const parent = group?.previousElementSibling;
    if (parent) {
      this.setFocusItem(parent);
    }
  }

  focusToFirst() {
    const items = this.getItems();
    this.setFocusItem(items[0]);
  }

  focusToLast() {
    const items = getItems(this.getElementView());
    this.setFocusItem(items[items.length - 1]);
  }
  setFocusItem(item) {
    this.#focusedItem = item;
    item.focus();
  }

  getItems() {
    if (!this.#focusedItem) {
      return getItems(this.getElementView());
    }
    return isTreeItem(this.#focusedItem) ? getTreesItems(this.getElementView()) : getItems(this.getElementView());
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
 * Récupérer l'élément de l'arbre si l'item se trouve dans un arbre
 * @param {HTMLElement} item : item
 * @returns {TreeItem}
 */
function getTreeItem(item) {
  return item.closest('[role="treeitem"]');
}
/**
 * Vérifier si l'item se trouve dans un arbre
 * @param {HTMLElement} item
 * @returns {boolean}
 */
function isTreeItem(item) {
  return item.closest('[role="treeitem"], [role="tree"]') !== null;
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
 * Vérifier si le noeud contenant l'item est ouvert
 * @param {HTMLElement} item
 */
function isOpened(item) {
  return getTreeItem(item)
    ?.getAttribute('aria-expanded') === 'true';
}
/**
 * Vérifier si le noeud contenant l'item est fermé
 * @param {HTMLElement} item
 */
function isClosed(item) {
  return getTreeItem(item)
    ?.getAttribute('aria-expanded') === 'false';
}
/**
 * Ouvrir le noeud contenant l'item
 * @param {HTMLElement} item
 */
function openNode(item) {
  getTreeItem(item)
    ?.setAttribute('aria-expanded', 'true');
}
/**
 * Fermer le noeud contenant l'item
 * @param {HTMLElement} item
 */
function closeNode(item) {
  getTreeItem(item)
    ?.setAttribute('aria-expanded', 'false');
}
/**
 * Donne les éléments de l'arbre visible
 * @param {HTMLElement} elementView
 * @returns {Array<HTMLElement>}
 */
function getTreesItems(elementView) {
  return getItems(elementView)
    .filter(item => !item.closest('[aria-expanded="false"] .tree__list') && !item.closest('.hidden'));
}

/**
 * Récupérer tous les items
 * @param {HTMLElement} elementView
 * @returns {Array<HTMLElement>}
 */
function getItems(elementView) {
  return [...elementView.querySelectorAll('.item, .item-like-button')];
}
/**
 * Récupérer tous les items d'une colonne
 * @param {HTMLElement} elementView
 * @param {number} indexColumn
 * @returns {Array<HTMLElement>}
 */
function getColumnItems(elementView, indexColumn) {
  if (indexColumn < 0) {
    return [];
  }
  /** @type {HTMLTableElement} */
  const table = elementView.querySelector('table');
  const array = [];
  // La 1ere ligne contient l'item story qui s'étend sur plusieurs colonnes
  array.push(table.rows[0].querySelector('.item'));
  // Ajout de tous les items se trouvant dans la cellule des lignes suivantes
  for (let i = 1; i < table.rows.length; i++) {
    array.push(...getItems(table.rows[i].cells[indexColumn]));
  }
  return array;
}

export default ManagerItemsDecoratorView;