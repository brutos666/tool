import StoreData from '../data/StoreData.js';
import DragDropPlaceholder from './DragDropPlaceholder.js';
import FocusManager from './FocusManager.js';

class DragDropFocusManager extends FocusManager {

  name = 'DragDropFocusManager';

  #isDragDropReady = false;

  /** @override */
  canEnter() {
    if (this.#isDragDropReady) {
      return false;
    }
    return super.canEnter();
  }

  /** @override */
  isFocusable(component) {
    if (isDropForbidden(component)) {
      return false;
    }
    if (isDragDropMode() && !getDragOverId(component)) {
      return false;
    }
    if (this.isPlaceholder(component) && this.getAllComponents()
      .includes(component)) {
      return true;
    }

    return super.isFocusable(component);
  }

  /** @override */
  onKeyDown(event) {
    if (!this.getCurrent()) {
      return;
    }
    if ([ 'Home', 'End', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown' ].includes(event.key)) {
      StoreData.getDragDropCenter()
        .startKeyboardDragDrop(this);
    }

    if (this.#isDragDropReady && event.key === 'Enter') {
      const currentFocusManager = this.getCurrentFocusManager();
      const overElement = currentFocusManager.getCurrent()
        .getElementView();
      StoreData.getDragDropCenter()
        .dropOverElement(overElement);
      return;
    }
    super.onKeyDown(event);
  }

  /** @override */
  setCurrent(component) {
    super.setCurrent(component);

    if (this.isPlaceholder(component)) {
      component.setVisible();
    }
  }
  /** @override */
  removeCurrent() {
    const currentFocusManager = this.getCurrentFocusManager();
    const current = currentFocusManager.getCurrent();
    if (this.isPlaceholder(current)) {
      current.setHidden();
    }

    super.removeCurrent();
  }
  /**
   * Récupère le système de navigation qui gère les composants et le courant
   * Pour des compositions de système de navigation, un système parent peut s'occuper du déplacement tandis que le positionnement du courant se fera par le système enfant
   * @returns {FocusManager} système de gestion du focus qui s'occupe du courant
   */
  getCurrentFocusManager() {
    return this;
  }
  /*
   * Démarrage/Arrêt de la navigation au clavier
   * --------------------------------------------------
   */
  /** @override */
  enableKeyNavigation() {
    super.enableKeyNavigation();

    const dragDropCenter = StoreData.getDragDropCenter();
    dragDropCenter.startKeyboardDragDrop(this);
  }
  /*
   * Drag&drop
   * ----------
   */
  enterDragDrop() {
    if (!isDragDropMode()) {
      return false;
    }
    if (this.#isDragDropReady) {
      return true;
    }
    this.#isDragDropReady = this.addPlaceholders();
    return this.#isDragDropReady;
  }
  exitDragDrop() {
    if (!this.#isDragDropReady) {
      return;
    }
    const currentFocusManager = this.getCurrentFocusManager();
    const overComponent = currentFocusManager.getCurrent();
    if (currentFocusManager.isPlaceholder(overComponent)) {
      currentFocusManager.setCurrent(currentFocusManager.getComponentWithPlaceholder(overComponent));
    }
    this.removePlaceHolders();
    this.#isDragDropReady = false;
  }
  isDragDropReady() {
    return this.#isDragDropReady;
  }
  addPlaceholders() {
    const components = [].concat(this.getAllComponents());
    let lastComponent = null;
    let index = 0;
    for (const component of components) {
      const placeholder = this.createPlaceholder(component, 'before');
      if (placeholder) {
        this.addComponentAt(index, placeholder);
        lastComponent = component;
        index++;
      }
      index++;
    }
    if (lastComponent) {
      // Pour le dernier composant concerné par le drag&drop, ajouter un placeholder après
      const placeholder = this.createPlaceholder(lastComponent, 'after');
      if (placeholder) {
        const index = this.getAllComponents()
          .indexOf(lastComponent);
        this.addComponentAt(index + 1, placeholder);
      }
      return true;
    }
    return false;
  }
  removePlaceHolders() {
    const placeholders = this.getAllComponents()
      .filter(component => this.isPlaceholder(component));
    this.destroyPlaceHolders(placeholders);
    this.removeComponents(placeholders);
  }
  destroyPlaceHolders(placeholders) {
    placeholders.forEach(placeholder => {
      const placeholderNode = placeholder.getView()
        .getElementView();
      placeholderNode.parentNode.removeChild(placeholderNode);
    });
  }
  createPlaceholder(component, position) {
    const overId = getDragOverId(component);
    if (!overId || isDropForbidden(component)) {
      return null;
    }

    const placeholder = new DragDropPlaceholder({ overId, position });
    placeholder.setHidden();
    const placeholderNode = placeholder.getElementView();
    const componentNode = component.getElementView();
    if (position === 'before') {
      componentNode.insertAdjacentElement('beforebegin', placeholderNode);
    } else {
      componentNode.insertAdjacentElement('afterend', placeholderNode);
    }
    return placeholder;
  }
  /**
   * Indique si le composant est un placeholder
   * @param {Component} component - Composant
   * @returns true si le composant est un placeholder pour le drag&drop
   */
  isPlaceholder(component) {
    return component?.getName() === 'DragDropPlaceholder';
  }
  getComponentWithPlaceholder(placeholder) {
    const components = this.getAllComponents();
    const indexPlaceholder = components.indexOf(placeholder);
    if (placeholder.getPosition() === 'before') {
      return components[indexPlaceholder + 1];
    }
    return components[indexPlaceholder - 1];
  }
  getComponentBeforePlaceholder(placeholder) {
    const components = this.getAllComponents();
    const indexPlaceholder = components.indexOf(placeholder);
    if (indexPlaceholder === 0) {
      return components[indexPlaceholder + 1];
    }
    if (placeholder.getPosition() === 'before' || indexPlaceholder === components.length - 1) {
      return components[indexPlaceholder - 1];
    }
    return components[indexPlaceholder + 1];
  }

}
/** Est-ce que l'on est en mode drag&drop */
function isDragDropMode() {
  return StoreData.getDragDropCenter()
    .isDragDropMode();
}
/**
 * Donner l'identifiant du drag over
 * @param {Component} component - Composant
 */
function getDragOverId(component) {
  return component.getView()
    .getElementView()
    .getAttribute('data-over-id');
}
/**
 * Indique si le relâchement est interdit à l'intérieur du composant
 * @param {Component} component - Composant
 * @returns true si interdit
 */
function isDropForbidden(component) {
  const componentNode = component.getView()
    .getElementView();
  if (componentNode.classList.contains('drop--forbidden')) {
    return true;
  }
  if (componentNode.closest('.drop--forbidden')) {
    return true;
  }
  return false;
}

export default DragDropFocusManager;