import StoreData from '../../../data/StoreData.js';
import DecoratorView from './DecoratorView.js';
/** @import View from '../../views/View.js'; */
/** @import TreeView from '../views/TreeView.js'; */

class DragDropDecoratorView extends DecoratorView {

  name = 'DragDropDecoratorView';

  #dragOverElement = null;

  /**
   * @constructor
   * @param {View} view
   */

  constructor(view) {
    super(view);
    // Le drag-over sera sur l'élément décoré ou sur le placeholder
    this.#dragOverElement = view.getElementView();
    const itemId = this.getElementView()
      .querySelector('[data-tree-item-id]')
      .getAttribute('data-tree-item-id');
    this.#dragOverElement.setAttribute('data-over-id', itemId);
    this.#dragOverElement.setAttribute('position', 'inside');

    this.addEventListener('dragstart', this.onDragStart.bind(this));
    this.addEventListener('dragend', this.onDragEnd.bind(this));
    this.addEventListener('drop', this.onDrop.bind(this));
    this.addEventListener('dragover', this.onDragOver.bind(this));
    this.addEventListener('dragleave', this.onDragLeave.bind(this));
  }

  getHtmlView() {
    return String.raw`<div class="drag-drop--decorator">${ super.getTemplateDecoratorHTML() }</div>`;
  }

  added() {
    super.added();
    const dragDropDecorator = this.getElementView();
    const componentWithDirection = dragDropDecorator.closest('[aria-orientation]');
    if (!componentWithDirection) {
      return;
    }
    const direction = componentWithDirection.getAttribute('aria-orientation') === 'horizontal' ? 'row' : 'column';
    dragDropDecorator.setAttribute('direction', direction);
  }

  setStaticView(id, child) {
    if (id !== 'dragAction') {
      return;
    }
    // Positionner l'icon de drag dans la barre d'outils de l'item
    this.getDecoratedView()
      .getElementView()
      .querySelector('.toolbar')
      .appendChild(child.getElementView());
    return;
  }

  onDragStart(event) {
    const draggedId = this.#dragOverElement.getAttribute('data-over-id');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('decorated-element', draggedId);
    this.startDragDrop();
  }
  onDragEnd() {
    this.endDragDrop();
  }

  onDragLeave() {
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
    const draggedId = event.dataTransfer.getData('decorated-element');
    const draggedOverId = this.#dragOverElement.getAttribute('data-over-id');

    if (!(draggedId && draggedId !== draggedOverId
      && !StoreData.getTreeItem()
        .isChildOf(draggedOverId, draggedId))) {
      return;
    }
    event.preventDefault();
    const direction = this.getElementView()
      .getAttribute('direction');
    const position = getDragOverPosition(event, direction, this.#dragOverElement);
    switch (position) {
      case 'inside':
        this.addOverInside();
        return;
      case 'afterbegin':
        this.addOverBefore(draggedOverId);
        return;
      case 'beforeend':
        this.addOverAfter(draggedOverId);
        return;
    }
  }

  addOverInside() {
    removePlaceholder();
    this.#dragOverElement.classList.add('drag-over');
    this.openNodeAfterDelay(this);
  }

  addOverBefore(draggedOverId) {
    addPlaceholder(this, 'afterbegin', draggedOverId);
    this.#dragOverElement.classList.remove('drag-over');
  }

  addOverAfter(draggedOverId) {
    addPlaceholder(this, 'beforeend', draggedOverId);
    this.#dragOverElement.classList.remove('drag-over');
  }

  removeOver() {
    this.#dragOverElement.classList.remove('drag-over');
    removePlaceholder();
  }

  dropOver(draggedId) {
    // L'élément peut être l'élément décoré ou un placeholder
    const dragOverElement = this.getElementView()
      .querySelector('.drag-over');
    if (dragOverElement) {
      const position = dragOverElement.getAttribute('position');
      const draggedOverId = dragOverElement.getAttribute('data-over-id');
      const movePosition = position === 'inside' ? 'inside' : position === 'afterbegin' ? 'before' : 'after';
      StoreData.getTreeItem()
        .moveItem(draggedId, draggedOverId, movePosition);
    }
    this.endDragDrop();
  }

  startDragDrop() {
    this.getElementView().classList.add('drag-start');
  }

  endDragDrop() {
    this.#dragOverElement.classList.remove('drag-over');
    removePlaceholder();
    this.getElementView().classList.remove('drag-start');
  }

  openNodeAfterDelay() {
    /** @type {TreeView} */
    const treeView = this.getImmediateDecoratedView()
      .getName() === 'TreeView'
      ? this.getImmediateDecoratedView()
      : null;
    if (!treeView || !treeView.isClosed()) {
      return;
    }
    setTimeout(() => {
      if (this.#dragOverElement.classList.contains('drag-over')) {
        treeView.setOpen(true);
      }
    }, 2000);
  }

}
/**
 * Ajout d'un placeholder servant de place pour l'item drag-and-drop
 * @param {DragDropDecoratorView} draggedOverView - décorateur sur lequel l'item est drag-and-drop
 * @param {number} position - position du placeholder (avant/après)
 * @param {number} draggedOverId - identifiant de l'item sur lequel l'item est drag-and-drop
 * @returns {HTMLDivElement} placeholder
 */
function addPlaceholder(draggedOverView, position, draggedOverId) {
  let placeHolder = document.querySelector('.placeholder');
  if (!placeHolder) {
    placeHolder = document.createElement('div');
    placeHolder.classList.add('placeholder');
    placeHolder.classList.add('drag-over');
  }
  /** @type {HTMLElement} */
  if (placeHolder.getAttribute('position') === position && placeHolder.getAttribute('data-over-id') === draggedOverId) {
    return placeHolder;
  }
  placeHolder.parentNode?.removeChild(placeHolder);
  placeHolder.setAttribute('data-over-id', draggedOverId);
  placeHolder.setAttribute('position', position);
  const dragDropDecorator = draggedOverView.getElementView();
  dragDropDecorator.insertAdjacentElement(position, placeHolder);
  return placeHolder;
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
 * @returns {'inside' | 'afterbegin' | 'beforeend'} position
 */
function getDragOverPosition(event, direction, dragOverElement) {
  if (!direction) {
    return 'inside';
  }
  let mousePosition = event.clientY;
  let dragOverElementBegin = dragOverElement.getBoundingClientRect().top;
  let limitSize = dragOverElement.offsetHeight;
  let delta = 10;
  if (direction === 'row') {
    mousePosition = event.clientX;
    dragOverElementBegin = dragOverElement.getBoundingClientRect().left;
    limitSize = dragOverElement.offsetWidth;
    delta = 20;
  }
  if (mousePosition < dragOverElementBegin + delta) {
    return 'afterbegin';
  }
  if (mousePosition > dragOverElementBegin + limitSize - delta) {
    return 'beforeend';
  }
  return 'inside';
}

export default DragDropDecoratorView;