import StoreData from '../../../data/StoreData.js';
import ClassDecoratorView from './ClassDecoratorView.js';
/** @import View from '../../views/View.js'; */

class DragDropDecoratorView extends ClassDecoratorView {

  name = 'DragDropDecoratorView';

  #idAttribute = 'data-tree-item-id';
  #dropFunction = (draggedId, droppedId, position) => {
    if (position === 'into') {
      StoreData.getTreeItem()
        .moveItemInto(draggedId, droppedId);
    }
  };
  #isChildOfFunction = (childId, parentId) => {
    return StoreData.getTreeItem()
      .isChildOf(childId, parentId);
  };

  #dragOverElement;
  #elementView;

  /**
   * @constructor
   * @param {View} view
   */

  constructor(view) {
    super(view, 'drag-drop--decorator');
    const elementView = view.getElementView();
    elementView.addEventListener('dragstart', this.dragStart.bind(this));
    elementView.addEventListener('dragover', this.dragOver.bind(this));
    elementView.addEventListener('drop', this.dropElement.bind(this));
    elementView.addEventListener('dragenter', this.dragEnter.bind(this));
    elementView.addEventListener('dragleave', this.dragLeave.bind(this));
    elementView.addEventListener('dragend', this.dragEnd.bind(this));
    this.#elementView = elementView;
  }

  setStaticView(id, child) {
    if (id !== 'dragAction') {
      return;
    }
    const dragGrip = child.getElementView();
    dragGrip.addEventListener('mousedown', () => {
      this.#elementView.setAttribute('draggable', 'true');
    });

    dragGrip.addEventListener('mouseup', () => {
      this.#elementView.setAttribute('draggable', 'false');
    });
    // Positionner l'icon de drag dans la barre d'outils de l'item
    this.getDecoratedView()
      .getElementView()
      .querySelector('.toolbar')
      .appendChild(child.getElementView());
    return;
  }

  dragStart(event) {
    const draggedId = getElementId(event.target, this.#idAttribute);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('decorated-element', draggedId);
  }
  dragEnd() {
    this.#dragOverElement?.classList.remove('drag-over');
    this.#dragOverElement = null;
  }

  dragOver(event) {
    const draggedId = event.dataTransfer.getData('decorated-element');
    const draggedOverId = getElementId(event.target, this.#idAttribute);
    if (draggedId && draggedId !== draggedOverId && !this.#isChildOfFunction(draggedOverId, draggedId)) {
      this.#dragOverElement?.classList.add('drag-over');
      event.preventDefault();
    }
  }

  dropElement(event) {
    const draggedId = event.dataTransfer.getData('decorated-element');
    if (!draggedId) {
      return;
    }
    event.preventDefault();
    const dropIntoId = getElementId(event.target, this.#idAttribute);
    this.#dropFunction(draggedId, dropIntoId, 'into');
    this.#dragOverElement?.classList.remove('drag-over');
    this.#dragOverElement = null;
  }

  dragEnter(event) {
    const draggedId = event.dataTransfer.getData('decorated-element');
    if (!draggedId) {
      return;
    }
    const dragEnter = getElementWithId(event.target, this.#idAttribute);
    const dragEnterId = dragEnter.getAttribute(this.#idAttribute);
    if (draggedId && draggedId !== dragEnterId && !this.#isChildOfFunction(dragEnterId, draggedId)) {
      this.#dragOverElement = dragEnter;
      this.#dragOverElement.classList.add('drag-over');
    }
  }

  dragLeave(event) {
    const dragLeave = getElementWithId(event.target, this.#idAttribute);
    dragLeave.classList.remove('drag-over');
  }

}
/**
 * Récupère l'identifiant de l'élément
 * @param {HTMLElement} target
 * @param {string} idAttribute
 * @returns {number} identifiant de l'élément
 */
function getElementId(target, idAttribute) {
  return getElementWithId(target, idAttribute)
    ?.getAttribute(idAttribute);
}
/**
 * Récupère l'élément le plus proche qui donne l'identifiant
 * @param {HTMLElement} target
 * @param {string} idAttribute
 * @returns {HTMLElement} élément
 */
function getElementWithId(target, idAttribute) {
  if (target.hasAttribute(idAttribute)) {
    return target;
  }
  return target.querySelector(`[${ idAttribute }]`) || target.closest(`[${ idAttribute }]`);
}

export default DragDropDecoratorView;