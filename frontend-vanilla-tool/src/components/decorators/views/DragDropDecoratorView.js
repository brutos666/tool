import StoreData from '../../../data/StoreData.js';
import DecoratorView from './DecoratorView.js';
/** @import View from '../../views/View.js'; */
/** @import TreeView from '../views/TreeView.js'; */

class DragDropDecoratorView extends DecoratorView {

  name = 'DragDropDecoratorView';

  #idAttribute = 'data-tree-item-id';
  #dropFunction = (draggedId, droppedId, position) => {
    const movePosition = position === 'inside' ? 'inside' : position === 'afterbegin' ? 'before' : 'after';
    StoreData.getTreeItem()
      .moveItem(draggedId, droppedId, movePosition);
  };
  #isChildOfFunction = (childId, parentId) => {
    return StoreData.getTreeItem()
      .isChildOf(childId, parentId);
  };

  #dragOverElement;
  #elementView;
  /** @type {TreeView} */
  #treeView;

  /**
   * @constructor
   * @param {View} view
   */

  constructor(view) {
    super(view);
    const elementView = view.getElementView();
    elementView.addEventListener('dragstart', this.dragStart.bind(this));
    elementView.addEventListener('dragend', this.dragEnd.bind(this));
    this.getElementView()
      .addEventListener('drop', this.dropElement.bind(this));
    // Écoute du over sur toute la zone afin de mieux positionner le placeholder
    this.getElementView()
      .addEventListener('dragover', this.dragOver.bind(this));
    this.getElementView()
      .addEventListener('dragenter', this.dragEnter.bind(this));
    this.getElementView()
      .addEventListener('dragleave', this.dragLeave.bind(this));
    this.#elementView = elementView;
    if (view.getName() === 'TreeView') {
      this.#treeView = view;
    }
  }

  getHtmlView() {
    return String.raw`<div class="drag-drop--decorator">${ super.getTemplateDecoratorHTML() }</div>`;
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
    event.target.classList.add('drag-start');
  }
  dragEnd(event) {
    this.#dragOverElement?.classList.remove('drag-over');
    this.#dragOverElement = null;
    this.removePlaceholder();
    event.target.classList.remove('drag-start');
  }

  dragOver(event) {
    const draggedId = event.dataTransfer.getData('decorated-element');
    const draggedOverId = getElementId(event.target, this.#idAttribute);
    if (!(draggedId && draggedId !== draggedOverId && !this.#isChildOfFunction(draggedOverId, draggedId))) {
      return;
    }
    event.preventDefault();
    const dragDropDecorator = event.target.closest('.drag-drop--decorator');
    const componentWithDirection = dragDropDecorator.closest('[aria-orientation]');
    if (!componentWithDirection) {
      this.#dragOverElement.classList.add('drag-over');
      return;
    }
    const direction = componentWithDirection.getAttribute('aria-orientation') === 'horizontal' ? 'row' : 'column';
    dragDropDecorator.setAttribute('direction', direction);

    const position = this.getPlaceHolderPosition(event, direction);
    if (position === 'inside') {
      this.removePlaceholder();
      this.#dragOverElement.classList.add('drag-over');
      this.openNodeAfterDelay();
      return;
    }
    this.addPlaceholder(this.#dragOverElement, position, draggedOverId);
    this.#dragOverElement.classList.remove('drag-over');
  }

  dropElement(event) {
    const draggedId = event.dataTransfer.getData('decorated-element');
    if (!draggedId) {
      return;
    }
    event.preventDefault();
    const placeHolder = document.querySelector('.placeholder');
    if (placeHolder) {
      const position = placeHolder.getAttribute('position');
      const draggedOverId = placeHolder.getAttribute('data-over-id');
      this.#dropFunction(draggedId, draggedOverId, position);
    } else if (this.#dragOverElement?.classList.contains('drag-over')) {
      const dropIntoId = getElementId(this.#dragOverElement, this.#idAttribute);
      this.#dropFunction(draggedId, dropIntoId, 'inside');
    }
    this.#dragOverElement?.classList.remove('drag-over');
    this.#dragOverElement = null;
    this.removePlaceholder();
    event.target.classList.remove('drag-start');
  }

  dragEnter(event) {
    const draggedId = event.dataTransfer.getData('decorated-element');
    if (!draggedId) {
      return;
    }
    const dragEnter = getElementWithId(event.target, this.#idAttribute);
    const dragEnterId = dragEnter.getAttribute(this.#idAttribute);
    if (!(draggedId && draggedId !== dragEnterId && !this.#isChildOfFunction(dragEnterId, draggedId))) {
      return;
    }
    this.#dragOverElement = dragEnter;
    this.#dragOverElement.classList.add('drag-over');
  }

  dragLeave(event) {
    const dragLeave = getElementWithId(event.target, this.#idAttribute);
    dragLeave.classList.remove('drag-over');
    this.removePlaceholder();
  }

  addPlaceholder(draggedOverElement, position, draggedOverId) {
    let placeHolder = document.querySelector('.placeholder');
    if (!placeHolder) {
      placeHolder = document.createElement('div');
      placeHolder.classList.add('placeholder');
    }
    /** @type {HTMLElement} */
    if (placeHolder.getAttribute('position') === position && placeHolder.getAttribute(this.#idAttribute) === draggedOverId) {
      return;
    }
    placeHolder.parentNode?.removeChild(placeHolder);
    placeHolder.setAttribute('data-over-id', draggedOverId);
    placeHolder.setAttribute('position', position);
    const dragDropDecorator = draggedOverElement.closest('.drag-drop--decorator');
    dragDropDecorator.insertAdjacentElement(position, placeHolder);
  }

  removePlaceholder() {
    const placeHolder = document.querySelector('.placeholder');
    placeHolder?.parentNode?.removeChild(placeHolder);
  }

  getPlaceHolderPosition(event, placeHolderDirection) {
    if (!this.#dragOverElement) {
      return;
    }
    let mousePosition = event.clientY;
    let dragOverElementBegin = this.#dragOverElement.getBoundingClientRect().top;
    let limitSize = this.#dragOverElement.offsetHeight;
    let delta = 10;
    if (placeHolderDirection === 'row') {
      mousePosition = event.clientX;
      dragOverElementBegin = this.#dragOverElement.getBoundingClientRect().left;
      limitSize = this.#dragOverElement.offsetWidth;
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

  openNodeAfterDelay() {
    if (!this.#treeView || !this.#treeView.isClosed()) {
      return;
    }
    setTimeout(() => {
      if (this.#dragOverElement?.classList.contains('drag-over')) {
        this.#treeView.setOpen(true);
      }
    }, 2000);
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
  const dragDropDecorator = target.closest('.drag-drop--decorator');
  return dragDropDecorator.querySelector(`[${ idAttribute }]`);
}

export default DragDropDecoratorView;