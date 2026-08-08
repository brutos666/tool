import FocusManager from './FocusManager.js';

/**
 * Navigation via les touches Tab. Un composant enfant peut contenir un autre système de navigation qui devra être avec les flèches.
 * Ainsi, le système TabFocusManager écoutera toujours la touche Tab en même temps que le focusManager enfant écoutera les flèches
 */
class TabFocusManager extends FocusManager {

  name = 'TabFocusManager';

  #navigateInChild = false;

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
   * Entrée et sortie d'un système de navigation par les touches Entrée/Escape
   * -------------------------------------------------------------------------
   */
  exit() {
    // Sortie avec Escape
    super.exit();

    if (this.#navigateInChild) {
      const focusManager = this.getChildFocusManager();
      focusManager.disableKeyNavigation();
    }
  }

  /*
   * Prise de focus et positionnement du courant
   * ---------------------------------------------------
   */
  setCurrent(component) {
    super.setCurrent(component);

    if (!this.getChildFocusManager()) {
      return;
    }
    // Si on arrive sur un composant qui gère la navigation, on laisse la navigation opérer à l'intérieur mais on garde le contrôle pour la tabulation
    const focusManager = this.getChildFocusManager();
    focusManager.enableKeyNavigation();
    focusManager.giveFocus();
    this.#navigateInChild = true;
  }
  removeCurrent() {
    if (this.#navigateInChild) {
      // Si le composant que l'on quitte gère la navigation, on la désactive et on écoute à nouveau toutes les touches de navigation
      const focusManager = this.getChildFocusManager();
      focusManager.disableKeyNavigation();
      this.#navigateInChild = false;
    }

    super.removeCurrent();
  }

  /*
   * Navigation au clavier
   * ---------------------
   */
  interceptKeys() {
    const keys = ['Tab'];
    if (super.canExit()) {
      keys.push('Escape');
    }
    if (this.#navigateInChild) {
      return keys;
    }
    keys.push('Home');
    keys.push('End');
    return keys;
  }

  /*
   * Démarrage/Arrêt de la navigation au clavier
   * --------------------------------------------------
   */
  /**
   * Active la navigation via le clavier. La tabulation pourra accéder à la zone.
   */
  enableKeyNavigation() {
    super.enableKeyNavigation();

    if (this.#navigateInChild) {
      const focusManager = this.getChildFocusManager();
      focusManager.enableKeyNavigation();
    }
  }

}
export default TabFocusManager;