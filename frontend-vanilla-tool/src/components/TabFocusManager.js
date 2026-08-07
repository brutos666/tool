import DOMUtilities from '../tools/DOMUtilities.js';
import FocusManager from './FocusManager.js';

class TabFocusManager extends FocusManager {

  /**
   * @constructor
   * @param {HTMLElement} container : conteneur des listes d'arbre
   * @param {'horizontal'|'vertical'} orientation : déplacement horizontal ou vertical
   * @param {boolean} enterToAccess : traite la possibilité d'entrer dans un élément pour naviguer à l'intérieur
   */
  constructor(container, orientation, enterToAccess) {
    super(container, orientation, true, enterToAccess);
  }

  /*
   * Navigation au clavier
   * ---------------------
   */
  interceptKeys() {
    if (DOMUtilities.isHidden(this.getCurrent())) {
      return [];
    }
    const keys = [ 'Home', 'End', 'Tab' ];
    if (super.canEnter()) {
      keys.push('Enter');
    }
    if (super.canExit()) {
      keys.push('Escape');
    }
    return keys;
  }

}
export default TabFocusManager;