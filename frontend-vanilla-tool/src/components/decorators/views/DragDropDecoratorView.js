import StoreData from '../../../data/StoreData.js';
import TreeUtilities from '../../../tools/TreeUtilities.js';
import DecoratorView from './DecoratorView.js';
/** @import View from '../../views/View.js'; */
/** @import TreeView from '../views/TreeView.js'; */

class DragDropDecoratorView extends DecoratorView {

  name = 'DragDropDecoratorView';

  #dragOverElement = null;
  #timeoutID = null;
  #treeItemId = null;

  /**
   * @constructor
   * @param {View} view
   */

  constructor(view) {
    super(view);
    // Le drag-over sera sur l'élément décoré ou sur le placeholder
    this.#dragOverElement = view.getElementView();
    this.#dragOverElement.setAttribute('position', 'inside');

    this.addEventListener('dragstart', this.onDragStart.bind(this));
    this.addEventListener('dragend', this.onDragEnd.bind(this));
    this.addEventListener('drop', this.onDrop.bind(this));
    this.addEventListener('dragover', this.onDragOver.bind(this));
    this.addEventListener('dragleave', this.onDragLeave.bind(this));
  }

  setTreeItemId(treeItemId) {
    this.#dragOverElement.setAttribute('data-over-id', treeItemId);
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
    const draggedId = this.getTreeItemId();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('decorated-element', draggedId);
    this.startDragDrop();
  }
  onDragEnd() {
    this.endDragDrop();
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
    event.preventDefault();
    this.dropOver(draggedId);
  }

  onDragOver(event) {
    // Vérifier que l'élément survolé est un élément direct et pas un sous enfant
    if (event.target.closest('.drag-drop--decorator') !== this.getElementView()) {
      return;
    }
    if (this.isDropForbidden()) {
      return;
    }
    event.preventDefault();
    const direction = this.getElementView()
      .getAttribute('direction');
    const position = getDragOverPosition(event, direction, this.#dragOverElement);
    switch (position) {
      case 'inside':
        this.addOverInside();
        this.openNodeAfterDelay();
        return;
      case 'before':
        this.addOverBefore();
        return;
      case 'after':
        this.addOverAfter();
        return;
    }
  }

  addOverInside() {
    removePlaceholder();
    this.#dragOverElement.classList.add('drag-over');
  }

  addOverBefore() {
    const draggedOverId = this.getTreeItemId();
    addPlaceholder(this, 'before', draggedOverId);
    this.removeInsideOver();
  }

  addOverAfter() {
    const draggedOverId = this.getTreeItemId();
    addPlaceholder(this, 'after', draggedOverId);
    this.removeInsideOver();
  }

  removeInsideOver() {
    this.#dragOverElement.classList.remove('drag-over');
    this.resetTimeout();
  }

  resetTimeout() {
    this.#dragOverElement.classList.remove('pending');
    if (this.#timeoutID) {
      clearTimeout(this.#timeoutID);
      this.#timeoutID = null;
    }
  }

  removeOver() {
    this.removeInsideOver();
    removePlaceholder();
  }

  dropOver(draggedId) {
    // L'élément peut être l'élément décoré ou un placeholder
    const dragOverElement = this.getElementView()
      .querySelector('.drag-over');
    if (!dragOverElement) {
      return;
    }
    const position = dragOverElement.getAttribute('position');
    const draggedOverId = dragOverElement.getAttribute('data-over-id');
    StoreData.getTreeItem()
      .moveItem(draggedId, draggedOverId, position);
    this.removeOver();
  }

  /**
   * Début du dragDrop soit par la souris soit par le clavier
   */
  startDragDrop() {
    const draggedId = this.getTreeItemId();
    StoreData.getDragDropCenter()
      .enterDragDropMode('mouse', draggedId);
  }

  endDragDrop() {
    this.removeOver();
    StoreData.getDragDropCenter()
      .exitDragDropMode();
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
          treeView.setOpen(true);
        }
        this.resetTimeout();
      }, 2000);
    }
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
 */
function removePlaceholder() {
  const placeHolder = document.querySelector('.placeholder');
  placeHolder?.parentNode?.removeChild(placeHolder);
}
/**
 * Donne la position où placer le survol de l'item drag-and-drop
 * @param {DragEvent} event - Événement de survol
 * @param {'row' | 'column' | null} direction - sens des éléments
 * @param {HTMLElement} dragOverElement
 * @returns {'inside' | 'before' | 'after'} position
 */
function getDragOverPosition(event, direction, dragOverElement) {
  if (!direction) {
    return 'inside';
  }
  let mousePosition = event.clientY;
  let dragOverElementBegin = dragOverElement.getBoundingClientRect().top;
  let limitSize = dragOverElement.offsetHeight;
  if (direction === 'row') {
    mousePosition = event.clientX;
    dragOverElementBegin = dragOverElement.getBoundingClientRect().left;
    limitSize = dragOverElement.offsetWidth;
  }
  const delta = TreeUtilities.isOpened(dragOverElement) && direction === 'column' ? 10 : limitSize / 3;
  if (mousePosition < dragOverElementBegin + delta) {
    return 'before';
  }
  if (mousePosition > dragOverElementBegin + limitSize - delta) {
    return 'after';
  }
  return 'inside';
}

export default DragDropDecoratorView;