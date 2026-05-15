import StoreData from '../data/StoreData.js';
import Component from './Component.js';
import DragDropCenterView from './views/DragDropCenterView.js';
/** @import DragDropDecoratorView from './decorators/views/DragDropDecoratorView.js'*/

/**
 * Cette classe s'occupe de la gestion clavier du drag and drop
 */
class DragDropCenter extends Component {

  name = 'DragDropCenter';

  static help_message_keyboard = 'Vous êtes en mode drag&drop. Veuillez sélectionner le nouvel emplacement en naviguant avec le clavier puis appuyer sur Entrée ou Escape pour annuler.';
  static help_message_mouse = 'Vous êtes en mode drag&drop. Veuillez sélectionner le nouvel emplacement en déplaçant la souris puis relâcher la souris à l\'endroit désiré ou appuyer sur Escape pour annuler.';

  #notification = null;

  constructor() {
    super(new DragDropCenterView());
  }

  /**
   * Entrer en mode dragDrop soit par la souris soit par le clavier
   * @param {DragDropDecoratorView} dragDropDecoratorView
   * @param {'keyboard'|'mouse'} dragDropType - Clavier ou souris
   */
  enterDragDropMode(dragDropDecoratorView, dragDropType) {
    this.#notification = StoreData.getNotificationCenter()
      .displayInformation(dragDropType === 'keyboard' ? DragDropCenter.help_message_keyboard : DragDropCenter.help_message_mouse);

    this.getView()
      .enterDragDropMode(dragDropDecoratorView, dragDropType);
  }

  exitDragDropMode() {
    this.getView()
      .exitDragDropMode();
    StoreData.getNotificationCenter()
      .removeInformation(this.#notification);
  }

  isDragDropMode() {
    return this.getView()
      .isDragDropMode();
  }

}

export default DragDropCenter;