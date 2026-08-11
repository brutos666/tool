import FocusManager from './FocusManager.js';

/**
 * Navigation via les touches Tab. Un composant enfant peut contenir un autre système de navigation qui devra être avec les flèches.
 * Ainsi, le système TabFocusManager écoutera toujours la touche Tab en même temps que le focusManager enfant écoutera les flèches
 */
class TabFocusManager extends FocusManager {

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
   * Entrée et sortie d'un système de navigation par les touches Entrée/Escape
   * -------------------------------------------------------------------------
   */
  exit() {
    // Sortie avec Escape
    super.exit();

    this.getChildFocusManager()
      ?.disableKeyNavigation();
  }

  /*
   * Positionnement du courant : gestion du système de navigation de l'enfant courant
   * --------------------------------------------------------------------------------
   */
  setCurrent(component) {
    super.setCurrent(component);

    const childFocusManager = this.getChildFocusManager();
    if (!this.isNavigationActive() || !childFocusManager) {
      return;
    }
    // Le courant gère son propre système de navigation. Il faut l'activer si le système de navigation courant est actif. On ne désactive pas le système de navigation via la tabulation pour pouvoir sortir de l'enfant avec la touche Tab
    childFocusManager.enableKeyNavigation();
    childFocusManager.giveFocus();
  }
  removeCurrent() {
    // Le composant que l'on quitte ne doit plus avoir son propre système de navigation actif s'il l'était
    this.getChildFocusManager()
      ?.disableKeyNavigation();

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
    if (this.getChildFocusManager()) {
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

    this.getChildFocusManager()
      ?.enableKeyNavigation();
  }
  /**
   * Désactive la navigation. La tabulation ne pourra jamais accéder aux composants gérés par le focusManager
   */
  disableKeyNavigation() {
    super.disableKeyNavigation();

    this.getChildFocusManager()
      ?.disableKeyNavigation();
  }

}
export default TabFocusManager;