import StoreData from '../../data/StoreData.js';
import TreeUtilities from '../../tools/TreeUtilities.js';
import DragDropDecorator from '../decorators/DragDropDecorator.js';
import View from './View.js';
/** @import DragDropDecoratorView from '../decorators/views/DragDropDecoratorView.js'; */
/** @import SpaceView from './SpaceView.js'; */

/**
 * Cette classe s'occupe de la navigation clavier du drag and drop
 */
class DragDropCenterView extends View {

  name = 'DragDropCenterView';

  #onKeyDown = this.onKeyDown.bind(this);
  #stopEventFunction = this.stopMouseEvent.bind(this);
  /** @type {DragDropDecoratorView} */
  #draggedView = null;
  /** @type {HTMLElement} */
  #overElement;
  /** @type {SpaceView} */
  #currentSpace;
  /** @type {HTMLElement[]} */
  #tabindexElements = [];

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

  constructor() {
    super();
  }

  getHtmlView() {
    return String.raw`<div class="drag-drop-center"></div>`;
  }

  /**
   * Entrer en mode dragDrop soit par la souris soit par le clavier
   * @param {DragDropDecoratorView} draggedView - Décorateur de la vue qui va être déplacée
   * @param {'keyboard'|'mouse'} dragDropType - Clavier ou souris
   */
  enterDragDropMode(draggedView, dragDropType) {
    if (dragDropType === 'keyboard') {
      document.addEventListener('keydown', this.#onKeyDown);
      document.addEventListener('click', this.#stopEventFunction, true);
      document.addEventListener('mousedown', this.#stopEventFunction, true);
      document.activeElement.blur();
      this.setOverElement(draggedView.getElementView(), 'before');
      document.querySelector('.working-space').classList.add('drag-drop-mode-keyboard');
    }
    this.#draggedView = draggedView;
    document.querySelector('.working-space').classList.add('drag-drop-mode');
    document.querySelectorAll('button:not([tabindex]), input:not([tabindex]), select:not([tabindex])')
      .forEach(element => {
        this.#tabindexElements.push(element);
        element.setAttribute('tabindex', '-1');
      });

    getAllDragDropElements()
      .forEach(element => {
        element.dispatchEvent(new CustomEvent(DragDropDecorator.EVENTS.dragOn, { detail: this.#draggedView.getDragDropId() }));
      });
  }
  /**
   * Sortie du mode dragDrop
   */
  exitDragDropMode() {
    document.removeEventListener('keydown', this.#onKeyDown);
    document.removeEventListener('click', this.#stopEventFunction, true);
    document.removeEventListener('mousedown', this.#stopEventFunction, true);
    document.querySelector('.working-space').classList.remove('drag-drop-mode-keyboard');
    document.querySelector('.working-space').classList.remove('drag-drop-mode');
    this.#overElement?.dispatchEvent(new CustomEvent(DragDropDecorator.EVENTS.dragOver, { detail: 'outside' }));
    this.#tabindexElements.forEach(element => {
      element.removeAttribute('tabindex');
    });
    const dragDropId = this.#draggedView.getDragDropId();
    getAllDragDropElements()
      .forEach(element => {
        element.dispatchEvent(new CustomEvent(DragDropDecorator.EVENTS.dragOff, { detail: dragDropId }));
      });
    this.#draggedView = null;
    this.#overElement = null;
    this.#tabindexElements = [];
  }

  /**
   * Indique si on est en mode drag&drop
   * @returns {boolean} true si en mode drag&drop
   */
  isDragDropMode() {
    return document.querySelector('.working-space')
      .classList.contains('drag-drop-mode');
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
    event.preventDefault();
    this.#keyEvent[event.key]?.(event);
  }

  /**
   * Méthode appelée lors de l'appui sur une touche de la souris
   * @param {Event} event - Event de souris
   */
  stopMouseEvent(event) {
    // Verrouiller les événements souris
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  onKeyHome() {
    this.changeOverElementFirst();
  }
  onKeyEnd() {
    this.changeOverElementLast();
  }
  onKeyArrowDown() {
    this.keyDirectionDown();
  }
  onKeyArrowUp() {
    this.keyDirectionUp();
  }

  onKeyArrowRight() {
    if (TreeUtilities.isTreeElement(this.#overElement)) {
      if (TreeUtilities.isClosed(this.#overElement)) {
        TreeUtilities.openNode(this.#overElement);
      } else if (TreeUtilities.isOpened(this.#overElement)) {
        this.changeOverElement('Down', 'inside');
      }
    } else {
      this.keyDirectionRight();
    }
  }

  onKeyArrowLeft() {
    if (TreeUtilities.isTreeElement(this.#overElement)) {
      if (TreeUtilities.isOpened(this.#overElement)) {
        TreeUtilities.closeNode(this.#overElement);
      } else {
        this.changeOverElementParent('inside');
      }
    } else {
      this.keyDirectionLeft();
    }
  }
  onKeyEnter(event) {
    if (!this.#overElement || !this.#overElement.contains(document.activeElement)) {
      return;
    }
    event.stopPropagation();
    this.dropElement(this.#overElement);
  }

  onKeyEscape() {
    this.#draggedView.dispatchEvent(new CustomEvent(DragDropDecorator.EVENTS.dragEnd));
  }

  interceptKeys() {
    return [ 'ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End', 'Enter', 'Escape' ];
  }

  keyDirectionDown() {
    if (this.#currentSpace !== StoreData.getCurrentSpace()) {
      this.changeOverElementFirst();
      return;
    }
    const direction = this.#overElement.getAttribute('direction');
    if (direction === 'column') {
      this.selectOverNext('Down');
    } else {
      this.changeOverElement('Down', 'inside');
    }
  }

  keyDirectionUp() {
    const direction = this.#overElement.getAttribute('direction');
    if (direction === 'column') {
      this.selectOverPrevious('Up');
    } else {
      this.changeOverElement('Up', 'inside');
    }
  }

  keyDirectionLeft() {
    const direction = this.#overElement.getAttribute('direction');
    if (direction === 'row') {
      this.selectOverPrevious('Left');
    } else {
      this.changeOverElement('Left', 'inside');
    }
  }

  keyDirectionRight() {
    const direction = this.#overElement.getAttribute('direction');
    if (direction === 'row') {
      this.selectOverNext('Right');
    } else {
      this.changeOverElement('Right', 'inside');
    }
  }
  selectOverNext(direction) {
    const position = this.#overElement.querySelector('.drag-over')
      .getAttribute('position');
    if (position === 'before') {
      this.#overElement.dispatchEvent(new CustomEvent(DragDropDecorator.EVENTS.dragOver, { detail: 'inside' }));
    } else if (position === 'inside') {
      if (TreeUtilities.isOpened(this.#overElement)) {
        this.changeOverElement(direction, 'before');
      } else if (hasNextOverElement(this.#overElement)) {
        this.changeOverElement(direction, 'before');
      } else {
        this.#overElement.dispatchEvent(new CustomEvent(DragDropDecorator.EVENTS.dragOver, { detail: 'after' }));
      }
    } else if (!TreeUtilities.isOpened(this.#overElement) && !this.changeOverElement(direction, 'before')) {
      this.changeOverElementParent('after');
    }
  }
  selectOverPrevious(direction) {
    const position = this.#overElement.querySelector('.drag-over')
      .getAttribute('position');
    if (position === 'after') {
      if (TreeUtilities.isOpened(this.#overElement)) {
        this.changeOverElementLastChild('after');
      } else {
        this.#overElement.dispatchEvent(new CustomEvent(DragDropDecorator.EVENTS.dragOver, { detail: 'inside' }));
      }
    } else if (position === 'inside') {
      this.#overElement.dispatchEvent(new CustomEvent(DragDropDecorator.EVENTS.dragOver, { detail: 'before' }));
    } else if (position === 'before') {
      this.changeOverElement(direction, 'inside');
      if (!hasNextOverElement(this.#overElement)) {
        this.#overElement.dispatchEvent(new CustomEvent(DragDropDecorator.EVENTS.dragOver, { detail: 'after' }));
      }
    } else {
      this.changeOverElement(direction, 'after');
    }
  }
  changeOverElement(direction, overPosition) {
    const cell = this.#overElement.closest('th, td');
    const overElements = cell ? getColumnDragDropElements(cell.cellIndex) : getDragOverElements();
    const nextOverElement = direction === 'Left' || direction === 'Right'
      ? giveHorizontalNextOverElement(direction, overElements, this.#overElement)
      : giveVerticalNextOverElement(direction, overElements, this.#overElement);
    if (nextOverElement) {
      this.setOverElement(nextOverElement, overPosition);
      return true;
    }
    return false;
  }

  /**
   * Change l'élément sélectionné pour le parent de l'élément en cours
   * @param {'before'|'after'|'inside'} position - Position du dragOver
   * @returns {boolean} true si un parent a été trouvé
   */
  changeOverElementParent(position) {
    const parent = TreeUtilities.getParent(this.#overElement);
    if (parent) {
      this.setOverElement(parent.closest('.drag-drop--decorator'), position);
      return true;
    }
    return false;
  }
  changeOverElementLastChild(position) {
    const lastChild = TreeUtilities.getLastChild(this.#overElement);
    if (lastChild) {
      this.setOverElement(lastChild, position);
    }
  }
  changeOverElementFirst() {
    const overElements = getDragOverElements();
    const overElement = overElements[0];
    if (overElement.classList.contains('drop--forbidden')) {
      return giveVerticalNextOverElement('Down', overElements, overElement);
    }
    this.setOverElement(overElement, 'inside');
  }
  changeOverElementLast() {
    const overElements = getDragOverElements();
    const overElement = overElements[overElements.length - 1];
    if (overElement.classList.contains('drop--forbidden')) {
      return giveVerticalNextOverElement('Up', overElements, overElement);
    }
    this.setOverElement(overElement, 'inside');
  }
  setOverElement(element, position = 'inside') {
    this.#overElement?.dispatchEvent(new CustomEvent(DragDropDecorator.EVENTS.dragOver, { detail: 'outside' }));
    this.#overElement = element;
    this.#overElement.dispatchEvent(new CustomEvent(DragDropDecorator.EVENTS.dragOver, { detail: position }));
    this.#currentSpace = StoreData.getCurrentSpace();
  }

  /**
   * Méthode appelée lors de la validation de l'endroit où l'élément doit être relâché
   */
  dropElement() {
    this.#overElement.dispatchEvent(new CustomEvent(DragDropDecorator.EVENTS.dragDrop, { detail: this.#draggedView.getDragDropId() }));
    this.#draggedView.dispatchEvent(new CustomEvent(DragDropDecorator.EVENTS.dragEnd));
  }

}

/**
 * Récupérer tous les éléments pouvant être survolés dans l'espace courant
 * @returns {Array<HTMLElement>}
 */
function getDragOverElements() {
  const allElements = [
    ...StoreData.getCurrentSpace()
      .getElementView()
      .querySelectorAll('.drag-drop--decorator')
  ];
  return TreeUtilities.filterVisibleElements(allElements);
}
/**
 * Récupérer tous les éléments pouvant être survolés
 * @returns {Array<HTMLElement>}
 */
function getAllDragDropElements() {
  return [...document.querySelectorAll('.drag-drop--decorator')];
}
/**
 * Indique si l'élément est suivi par un autre élément pouvant être survolé
 * @param {HTMLElement} overElement
 * @returns {boolean} true si l'élément est suivi par un autre élément pouvant être survolé
 */
function hasNextOverElement(overElement) {
  return overElement.nextElementSibling?.classList.contains('drag-drop--decorator') || overElement.parentNode.nextElementSibling?.querySelector('.drag-drop--decorator');
}
/**
 * Récupérer tous les éléments drag&drop d'une colonne
 * @param {number} indexColumn
 * @returns {Array<HTMLElement>}
 */
function getColumnDragDropElements(indexColumn) {
  if (indexColumn < 0) {
    return [];
  }
  const tableElement = StoreData.getCurrentSpace()
    .getElementView()
    .querySelector('table');
  const array = [];
  // La 1ere ligne contient l'item story qui s'étend sur plusieurs colonnes
  array.push(tableElement.rows[0].querySelector('.drag-drop--decorator'));
  // Ajout de tous les items se trouvant dans la cellule des lignes suivantes
  for (let i = 1; i < tableElement.rows.length; i++) {
    array.push(...tableElement.rows[i].cells[indexColumn].querySelectorAll('.drag-drop--decorator'));
  }
  return array;
}

/**
 * Donne le prochain élément autorisé pour recevoir l'élément déplacé
 * @param {'Down'|'Up'} direction - direction vers laquelle le clavier se dirige
 * @param {Array<HTMLElement>} dragDropElements - Liste des éléments de type drag&drop
 * @param {HTMLElement} currentElement - Element actuellement sélectionné ou interdit à la sélection
 * @returns {HTMLElement|null} Element suivant
 */
function giveVerticalNextOverElement(direction, dragDropElements, currentElement) {
  const idx = dragDropElements.indexOf(currentElement);
  let indexToFocus = idx;
  switch (direction) {
    case 'Down':
      indexToFocus = idx + 1;
      break;
    case 'Up':
      indexToFocus = idx - 1;
      break;
  }
  const nextOverElement = dragDropElements[indexToFocus];
  if (nextOverElement?.classList.contains('drop--forbidden')) {
    return giveVerticalNextOverElement(direction, dragDropElements, nextOverElement);
  }
  return nextOverElement;
}
/**
 * Donne le prochain élément autorisé pour recevoir l'élément déplacé
 * @param {'Left'|'Right'} direction - direction vers laquelle le clavier se dirige
 * @param {Array<HTMLElement>} currentColumnElements - Liste des éléments pour la colonne de l'élément sélectionné
 * @param {HTMLElement} currentElement - Element actuellement sélectionné ou interdit à la sélection
 * @returns {HTMLElement|null} Element suivant
 */
function giveHorizontalNextOverElement(direction, currentColumnElements, currentElement) {
  const cell = currentElement.closest('th, td');
  if (!cell) {
    return null;
  }
  const currentColumnIndex = currentColumnElements.indexOf(currentElement);
  let overElements;
  switch (direction) {
    case 'Right':
      overElements = getColumnDragDropElements(cell.cellIndex + 1);
      break;
    case 'Left':
      overElements = getColumnDragDropElements(cell.cellIndex - 1);
      break;
  }
  const nextOverElement = overElements[currentColumnIndex];
  if (nextOverElement?.classList.contains('drop--forbidden')) {
    return giveHorizontalNextOverElement(direction, overElements, nextOverElement);
  }
  return nextOverElement;
}

export default DragDropCenterView;