import DragDropDecorator from '../decorators/DragDropDecorator.js';
import View from './View.js';

/**
 * Cette classe s'occupe de la navigation clavier du drag and drop
 */
class DragDropCenterView extends View {

  name = 'DragDropCenterView';

  #stopEventFunction = this.stopMouseEvent.bind(this);
  #draggedId = null;
  /** @type {HTMLElement[]} */
  #tabindexElements = [];

  constructor() {
    super();
  }

  getHtmlView() {
    return String.raw`<div class="drag-drop-center"></div>`;
  }

  /**
   * Entrer en mode dragDrop soit par la souris soit par le clavier
   * @param {'keyboard'|'mouse'} dragDropType - Clavier ou souris
   * @param {number} draggedId - Identifiant du composant déplacé
   */
  enterDragDropMode(dragDropType, draggedId) {
    if (dragDropType === 'keyboard') {
      document.addEventListener('click', this.#stopEventFunction, true);
      document.addEventListener('mousedown', this.#stopEventFunction, true);
      document.querySelector('.working-space').classList.add('drag-drop-mode-keyboard');
    }

    this.#draggedId = draggedId;
    document.querySelector('.working-space').classList.add('drag-drop-mode');
    document.querySelectorAll('button[tabindex="0"], input[tabindex="0"], select[tabindex="0"]')
      .forEach(element => {
        this.#tabindexElements.push(element);
        element.setAttribute('tabindex', '-1');
      });

    getAllDragDropElements()
      .forEach(element => {
        element.dispatchEvent(new CustomEvent(DragDropDecorator.EVENTS.dragOn, { detail: this.#draggedId }));
      });
  }
  /**
   * Sortie du mode dragDrop
   */
  exitDragDropMode() {
    document.removeEventListener('click', this.#stopEventFunction, true);
    document.removeEventListener('mousedown', this.#stopEventFunction, true);
    document.querySelector('.working-space').classList.remove('drag-drop-mode-keyboard');
    document.querySelector('.working-space').classList.remove('drag-drop-mode');
    this.#tabindexElements.forEach(element => {
      element.setAttribute('tabindex', '0');
    });
    getAllDragDropElements()
      .forEach(element => {
        element.dispatchEvent(new CustomEvent(DragDropDecorator.EVENTS.dragOff, { detail: this.#draggedId }));
      });
    this.#draggedId = null;
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
   * Méthode appelée lors de l'appui sur une touche de la souris
   * @param {Event} event - Event de souris
   */
  stopMouseEvent(event) {
    // Verrouiller les événements souris
    event.preventDefault();
    event.stopImmediatePropagation();
  }

}

/**
 * Récupérer tous les éléments pouvant être survolés
 * @returns {Array<HTMLElement>}
 */
function getAllDragDropElements() {
  return [...document.querySelectorAll('.drag-drop--decorator')];
}

export default DragDropCenterView;