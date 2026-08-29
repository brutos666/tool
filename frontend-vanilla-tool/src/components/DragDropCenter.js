import StoreData from '../data/StoreData.js';
import Component from './Component.js';
import DragDropCenterView from './views/DragDropCenterView.js';
/** @import DragDropFocusManager from './DragDropFocusManager.js'; */

/**
 * Cette classe s'occupe de la gestion clavier du drag and drop
 */
class DragDropCenter extends Component {

  name = 'DragDropCenter';

  static help_message_keyboard = 'Vous êtes en mode drag&drop. Veuillez sélectionner le nouvel emplacement en naviguant avec le clavier puis appuyer sur Entrée ou Escape pour annuler.';
  static help_message_mouse = 'Vous êtes en mode drag&drop. Veuillez sélectionner le nouvel emplacement en déplaçant la souris puis relâcher la souris à l\'endroit désiré ou appuyer sur Escape pour annuler.';

  #notification = null;
  #draggedId;
  /** @type {boolean} */
  #dragDropMode = false;
  /** @type {'keyboard', 'mouse'} */
  #dragDropType;

  #onKeyDownEvent = this.onKeyDown.bind(this);

  constructor() {
    super(new DragDropCenterView());
  }

  getDraggedId() {
    return this.#draggedId;
  }

  /**
   * Entrer en mode dragDrop soit par la souris soit par le clavier
   * @param {'keyboard'|'mouse'} dragDropType - Clavier ou souris
   * @param {number} draggedId - Identifiant du composant déplacé
   */
  enterDragDropMode(dragDropType, draggedId) {
    this.#draggedId = draggedId;
    this.#dragDropType = dragDropType;
    this.#dragDropMode = true;

    let information = DragDropCenter.help_message_mouse;
    if (this.#dragDropType === 'keyboard') {
      document.addEventListener('keydown', this.#onKeyDownEvent);
      // Désactiver tous les focusManager qui ne concerne pas le drag&drop
      StoreData.getWorkingSpace()
        .enterDragDropMode();
      information = DragDropCenter.help_message_keyboard;
    }

    this.#notification = StoreData.getNotificationCenter()
      .displayInformation(information);
    this.getView()
      .enterDragDropMode(this.#dragDropType, draggedId);
  }

  exitDragDropMode() {
    this.#dragDropMode = false;
    if (this.#dragDropType === 'keyboard') {
      document.removeEventListener('keydown', this.#onKeyDownEvent);
      // Réactiver tous les focusManager qui ne concerne pas le drag&drop
      StoreData.getWorkingSpace()
        .exitDragDropMode();
    }

    this.getView()
      .exitDragDropMode();
    StoreData.getNotificationCenter()
      .removeInformation(this.#notification);
  }

  isDragDropMode() {
    return this.#dragDropMode;
  }

  /**
   * Méthode appelée lors de l'appui sur une touche de clavier
   * @param {Event} event - Event de clavier
   */
  onKeyDown(event) {
    if (event.key !== 'Escape') {
      return;
    }
    this.exitDragDropMode();
    event.preventDefault();
  }

  dropOverElement(overElement) {
    this.exitDragDropMode();

    const position = overElement.getAttribute('position');
    const draggedOverId = overElement.getAttribute('data-over-id');
    const draggedId = this.getDraggedId();
    StoreData.getTreeItem()
      .moveItem(draggedId, draggedOverId, position);
  }

}

export default DragDropCenter;