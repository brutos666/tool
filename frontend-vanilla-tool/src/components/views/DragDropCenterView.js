import View from './View.js';

/**
 * Cette classe s'occupe de la navigation clavier du drag and drop
 */
class DragDropCenterView extends View {

  name = 'DragDropCenterView';

  #stopEventFunction = this.stopMouseEvent.bind(this);

  constructor() {
    super();
  }

  getHtmlView() {
    return String.raw`<div class="drag-drop-center"></div>`;
  }

  /**
   * Entrer en mode dragDrop soit par la souris soit par le clavier
   * @param {'keyboard'|'mouse'} dragDropType - Clavier ou souris
   */
  enterDragDropMode(dragDropType) {
    if (dragDropType === 'keyboard') {
      document.addEventListener('click', this.#stopEventFunction, true);
      document.addEventListener('mousedown', this.#stopEventFunction, true);
      document.querySelector('.working-space').classList.add('drag-drop-mode-keyboard');
    }
    document.querySelector('.working-space').classList.add('drag-drop-mode');
  }
  /**
   * Sortie du mode dragDrop
   */
  exitDragDropMode() {
    document.removeEventListener('click', this.#stopEventFunction, true);
    document.removeEventListener('mousedown', this.#stopEventFunction, true);
    document.querySelector('.working-space').classList.remove('drag-drop-mode-keyboard');
    document.querySelector('.working-space').classList.remove('drag-drop-mode');
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

export default DragDropCenterView;