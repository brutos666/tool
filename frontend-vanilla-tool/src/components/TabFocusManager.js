import CompositeFocusManager from './CompositeFocusManager.js';

/**
 * Navigation via les touches Tab. Un composant enfant peut contenir un autre système de navigation qui devra être avec les flèches.
 * Ainsi, le système TabFocusManager écoutera toujours la touche Tab en même temps que le focusManager enfant écoutera les flèches
 */
class TabFocusManager extends CompositeFocusManager {

  name = 'TabFocusManager';

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
    const keys = ['Tab'];
    if (this.isInside()) {
      keys.push('Escape');
    }
    if (super.canEnter()) {
      keys.push('Enter');
    }
    if (this.getCurrentFocusManager()) {
      return keys;
    }
    keys.push('Home');
    keys.push('End');
    return keys;
  }

}
export default TabFocusManager;