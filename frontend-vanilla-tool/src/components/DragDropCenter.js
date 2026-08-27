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
  /** @type {DragDropFocusManager} */
  #currentFocusManager;

  #onKeyDownEvent = this.onKeyDown.bind(this);

  constructor() {
    super(new DragDropCenterView());
  }

  getDraggedId() {
    return this.#draggedId;
  }

  startKeyboardDragDrop(focusManager) {
    if (!focusManager || !this.isDragDropMode()) {
      return;
    }
    if (this.#currentFocusManager === focusManager) {
      return;
    }
    if (this.#currentFocusManager && !this.#currentFocusManager.isParentControlNavigation()) {
      this.#currentFocusManager.exitDragDrop();
    }
    this.#currentFocusManager = focusManager;
    if (this.isDragDropMode()) {
      this.#currentFocusManager.enterDragDrop();
    }
  }
  stopKeyboardDragDrop() {
    if (!this.#currentFocusManager) {
      return;
    }
    if (this.#currentFocusManager.isParentControlNavigation()) {
      this.#currentFocusManager.getParentFocusManager()
        .exitDragDrop();
    } else {
      this.#currentFocusManager.exitDragDrop();
    }
    this.#currentFocusManager = null;
  }

  /**
   * Entrer en mode dragDrop soit par la souris soit par le clavier
   * @param {'keyboard'|'mouse'} dragDropType - Clavier ou souris
   * @param {number} draggedId - Identifiant du composant déplacé
   */
  enterDragDropMode(dragDropType, draggedId) {
    if (dragDropType === 'keyboard') {
      document.addEventListener('keydown', this.#onKeyDownEvent);
    }

    this.#draggedId = draggedId;

    this.#notification = StoreData.getNotificationCenter()
      .displayInformation(dragDropType === 'keyboard' ? DragDropCenter.help_message_keyboard : DragDropCenter.help_message_mouse);

    this.getView()
      .enterDragDropMode(dragDropType, draggedId);
  }

  exitDragDropMode() {
    document.removeEventListener('keydown', this.#onKeyDownEvent);

    this.getView()
      .exitDragDropMode();
    StoreData.getNotificationCenter()
      .removeInformation(this.#notification);
  }

  isDragDropMode() {
    return this.getView()
      .isDragDropMode();
  }

  /**
   * Méthode appelée lors de l'appui sur une touche de clavier
   * @param {Event} event - Event de clavier
   */
  onKeyDown(event) {
    if (event.key !== 'Escape') {
      return;
    }
    const currentFocusManager = this.#currentFocusManager;
    this.exitDragDropMode();
    this.stopKeyboardDragDrop();
    currentFocusManager.giveFocus();

    event.preventDefault();
  }

  dropOverElement(overElement) {
    const position = overElement.getAttribute('position');
    const currentFocusManager = this.#currentFocusManager?.getCurrentFocusManager();
    if (currentFocusManager && [ 'before', 'after' ].includes(position)) {
      // Astuce pour que le courant devienne le nouveau ajouté par le déplacement
      currentFocusManager.removeCurrent();
    }

    this.exitDragDropMode();
    this.stopKeyboardDragDrop();

    const draggedOverId = overElement.getAttribute('data-over-id');
    const draggedId = this.getDraggedId();
    StoreData.getTreeItem()
      .moveItem(draggedId, draggedOverId, position);

    currentFocusManager?.giveFocus();
  }

}

export default DragDropCenter;