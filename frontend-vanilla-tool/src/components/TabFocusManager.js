import DOMUtilities from '../tools/DOMUtilities.js';
import FocusManager from './FocusManager.js';

class TabFocusManager extends FocusManager {

  #onlyTab = false;

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
    if (DOMUtilities.isHidden(this.getCurrentElement())) {
      return [];
    }
    const keys = ['Tab'];
    if (super.canExit()) {
      keys.push('Escape');
    }
    if (this.#onlyTab) {
      return keys;
    }
    keys.push('Home');
    keys.push('End');
    return keys;
  }

  onKeyTab(event) {
    this.#exit();
    this.focusToDirection(event.shiftKey ? 'Up' : 'Down');
    this.#enter();
  }

  #enter() {
    if (!this.getChildFocusManager()) {
      return;
    }
    // Si on arrive sur un composant qui gère la navigation, on laisse la navigation opérer à l'intérieur mais on garde le contrôle pour la tabulation
    const focusManager = this.getChildFocusManager();
    focusManager.enableKeyNavigation();
    focusManager.giveFocus();
    this.#onlyTab = true;
  }

  #exit() {
    if (!this.#onlyTab) {
      return;
    }
    // Si le composant que l'on quitte gère la navigation, on la désactive et on écoute à nouveau toutes les touches de navigation
    const focusManager = this.getChildFocusManager();
    focusManager.disableKeyNavigation();
    this.#onlyTab = false;
  }

}
export default TabFocusManager;