import DragDropDecorator from '../DragDropDecorator.js';
import DecoratorView from './DecoratorView.js';
/** @import View from '../../views/View.js'; */
/** @import TreeView from '../views/TreeView.js'; */

class DragDropDecoratorView extends DecoratorView {

  name = 'DragDropDecoratorView';

  #onDragStartEvent = this.onDragStart.bind(this);
  #onDragEndEvent = this.onDragEnd.bind(this);
  #onDropEvent = this.onDrop.bind(this);
  #onDragOverEvent = this.onDragOver.bind(this);
  #onDragLeaveEvent = this.onDragLeave.bind(this);

  #dragOverElement = null;
  #timeoutID = null;
  #treeItemId = null;
  /** @type {'inside', 'before', 'after', 'outside'} */
  #currentPosition = 'outside';
  /**
   * @constructor
   * @param {View} view
   */

  constructor(view) {
    super(view);
    // Le drag-over sera sur l'élément décoré ou sur le placeholder
    this.#dragOverElement = view.getElementView();
    this.#dragOverElement.setAttribute('position', 'inside');

    this.addEventListener('dragstart', this.#onDragStartEvent);
    this.addEventListener('dragend', this.#onDragEndEvent);
    this.addEventListener('drop', this.#onDropEvent);
    this.#dragOverElement.addEventListener('dragover', this.#onDragOverEvent);
    this.addEventListener('dragleave', this.#onDragLeaveEvent);
  }

  setTreeItemId(treeItemId) {
    this.#dragOverElement.setAttribute('data-over-id', treeItemId);
    this.getElementView()
      .setAttribute('data-item-id', treeItemId);
    this.#treeItemId = treeItemId;
  }
  getTreeItemId() {
    return this.#treeItemId;
  }

  getHtmlView() {
    return String.raw`<div class="drag-drop--decorator">${ super.getTemplateDecoratorHTML() }</div>`;
  }

  added(parent) {
    super.added(parent);

    const dragDropDecorator = this.getElementView();
    const componentWithDirection = dragDropDecorator.closest('[aria-orientation]');
    if (!componentWithDirection) {
      return;
    }
    const direction = componentWithDirection.getAttribute('aria-orientation') === 'horizontal' ? 'row' : 'column';
    dragDropDecorator.setAttribute('direction', direction);
  }

  authorizeDrop(dropIsAuthorized) {
    if (dropIsAuthorized) {
      this.getElementView().classList.remove('drop--forbidden');
    } else {
      this.getElementView().classList.add('drop--forbidden');
    }
  }
  isDropForbidden() {
    return this.getElementView().classList.contains('drop--forbidden');
  }

  onDragStart(event) {
    // Vérifier que l'élément déplacé est un élément direct et pas un sous enfant
    if (event.target.closest('.drag-drop--decorator') !== this.getElementView()) {
      return;
    }
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('decorated-element', this.getTreeItemId());
    this.dispatchEvent(new CustomEvent(DragDropDecorator.EVENTS.dragStart));
  }
  onDragEnd() {
    this.dispatchEvent(new CustomEvent(DragDropDecorator.EVENTS.dragEnd));
    this.removeOver();
  }

  onDragLeave(event) {
    if (this.getElementView()
      .contains(event.relatedTarget) && event.relatedTarget.closest('.drag-drop--decorator') === this.getElementView()) {
      return;
    }

    this.removeOver();
  }
  onDrop(event) {
    const draggedId = event.dataTransfer.getData('decorated-element');
    if (!draggedId) {
      return;
    }
    const dragOverElement = this.getElementView()
      .querySelector('.drag-over');
    if (!dragOverElement) {
      return;
    }
    event.preventDefault();
    const position = dragOverElement.getAttribute('position');
    this.dispatchEvent(new CustomEvent(DragDropDecorator.EVENTS.dragDrop, { detail: position }));

    this.removeOver();
  }

  onDragOver(event) {
    const dragDropDecorator = event.target.closest('.drag-drop--decorator');
    // Vérifier que l'élément survolé est un élément direct et pas un sous enfant
    if (dragDropDecorator !== this.getElementView()) {
      return;
    }
    if (this.isDropForbidden()) {
      return;
    }
    event.preventDefault();
    const direction = this.getElementView()
      .getAttribute('direction');
    const position = getDragOverPosition(event, direction, this.#dragOverElement);
    if (position === this.#currentPosition) {
      return;
    }
    this.#currentPosition = position;
    switch (position) {
      case 'inside':
        this.addOverInside();
        this.openNodeAfterDelay();
        break;
      case 'before':
        this.addOverBefore();
        break;
      case 'after':
        this.addOverAfter();
        break;
    }
  }

  addOverInside() {
    this.#currentPosition = 'inside';
    removePlaceholder(this);
    this.#dragOverElement.classList.add('drag-over');
  }
  addOverBefore() {
    this.#currentPosition = 'before';
    addPlaceholder(this, 'before', this.getTreeItemId());
    this.removeInsideOver();
  }
  addOverAfter() {
    this.#currentPosition = 'after';
    addPlaceholder(this, 'after', this.getTreeItemId());
    this.removeInsideOver();
  }
  removeInsideOver() {
    this.#dragOverElement.classList.remove('drag-over');
    this.resetTimeout();
  }
  removeOver() {
    this.#currentPosition = 'outside';
    this.removeInsideOver();
    removePlaceholder(this);
  }

  openNodeAfterDelay() {
    /** @type {TreeView} */
    const treeView = this.getDecoratedViewByName('TreeView');
    if (!treeView || !treeView.isClosed()) {
      return;
    }
    if (!this.#timeoutID) {
      this.#dragOverElement.classList.add('pending');
      this.#timeoutID = setTimeout(() => {
        if (this.#dragOverElement.classList.contains('drag-over')) {
          this.dispatchEvent(new CustomEvent(DragDropDecorator.EVENTS.dragOverTree));
        }
        this.resetTimeout();
      }, 2000);
    }
  }
  resetTimeout() {
    this.#dragOverElement.classList.remove('pending');
    if (this.#timeoutID) {
      clearTimeout(this.#timeoutID);
      this.#timeoutID = null;
    }
  }

  destroy() {
    this.#dragOverElement.removeEventListener('dragstart', this.#onDragStartEvent);
    this.#dragOverElement.removeEventListener('dragend', this.#onDragEndEvent);
    this.#dragOverElement.removeEventListener('drop', this.#onDropEvent);
    this.#dragOverElement.addEventListener('dragover', this.#onDragOverEvent);
    this.#dragOverElement.removeEventListener('dragleave', this.#onDragLeaveEvent);
    this.resetTimeout();

    super.destroy();

    this.#onDragStartEvent = null;
    this.#onDragEndEvent = null;
    this.#onDropEvent = null;
    this.#onDragOverEvent = null;
    this.#onDragLeaveEvent = null;
    this.#dragOverElement = null;
    this.#timeoutID = null;
    this.#treeItemId = null;
    this.#currentPosition = null;
  }

}
/**
 * Ajout d'un placeholder servant de place pour l'item drag-and-drop
 * @param {DragDropDecoratorView} draggedOverView - décorateur sur lequel l'item est drag-and-drop
 * @param {string} position - position du placeholder (avant/après)
 * @param {number} draggedOverId - identifiant de l'item sur lequel l'item est drag-and-drop
 */
function addPlaceholder(draggedOverView, position, draggedOverId) {
  let placeHolder = document.querySelector('.placeholder');
  if (!placeHolder) {
    placeHolder = document.createElement('div');
    placeHolder.classList.add('placeholder');
    placeHolder.classList.add('drag-over');
    placeHolder.setAttribute('tabindex', 0);
  }
  /** @type {HTMLElement} */
  if (placeHolder.getAttribute('position') === position && placeHolder.getAttribute('data-over-id') === draggedOverId) {
    return placeHolder;
  }
  placeHolder.parentNode?.removeChild(placeHolder);
  placeHolder.setAttribute('data-over-id', draggedOverId);
  placeHolder.setAttribute('position', position);
  const dragDropDecorator = draggedOverView.getElementView();
  dragDropDecorator.insertAdjacentElement(position === 'before' ? 'afterbegin' : 'beforeend', placeHolder);
}
/**
 * Suppression du placeholder
 * @param {DragDropDecoratorView} draggedOverView - décorateur sur lequel l'item est drag-and-drop
 */
function removePlaceholder(draggedOverView) {
  const placeHolder = document.querySelector('.placeholder');
  const parentNode = placeHolder?.parentNode;
  if (parentNode === draggedOverView.getElementView()) {
    // NOTE : Le place holder est le même pour tout le monde. Ne pas l'enlever s'il est utilisé par un autre composant
    placeHolder?.parentNode?.removeChild(placeHolder);
  }
}
/**
 * Donne la position où placer le survol de l'item drag-and-drop
 * @param {DragEvent} event - Événement de survol
 * @param {'row' | 'column' | null} direction - sens des éléments
 * @param {HTMLElement} dragOverElement - donne la taille de l'élément survolé (dans le cas d'un arbre ouvert, c'est l'arbre et ses enfants)
 * @returns {'inside' | 'before' | 'after'} position
 */
function getDragOverPosition(event, direction, dragOverElement) {
  if (!direction) {
    return 'inside';
  }
  let mousePosition = event.clientY;
  let dragOverElementBegin = dragOverElement.getBoundingClientRect().top;
  let dragOverElementEnd = dragOverElement.getBoundingClientRect().bottom;
  if (direction === 'row') {
    mousePosition = event.clientX;
    dragOverElementBegin = dragOverElement.getBoundingClientRect().left;
    dragOverElementEnd = dragOverElement.getBoundingClientRect().right;
  }
  if (mousePosition < dragOverElementBegin + 10) {
    return 'before';
  }
  if (mousePosition > dragOverElementEnd - 5) {
    return 'after';
  }
  return 'inside';
}

export default DragDropDecoratorView;