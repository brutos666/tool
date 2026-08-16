import FocusManager from './FocusManager.js';

/** Désigne des systèmes de navigation composés d'autre système de navigation. Par exemple, on peut naviguer d'un composant à l'autre avec la tabulation et dans un composant avec les flèches */
class CompositeFocusManager extends FocusManager {

  name = 'CompositeFocusManager';
  /*
   * Entrée et sortie d'un système de navigation par les touches Entrée/Escape
   * -------------------------------------------------------------------------
   */
  /** @override */
  exit() {
    // Sortie avec Escape
    super.exit();

    this.getAccessibleChildFocusManager()
      ?.disableKeyNavigation();
  }

  /*
   * Positionnement du courant : gestion du système de navigation de l'enfant courant
   * --------------------------------------------------------------------------------
   */
  /** @override */
  setCurrent(component) {
    super.setCurrent(component);

    const childFocusManager = this.getAccessibleChildFocusManager();
    if (!this.isNavigationActive() || !childFocusManager) {
      return;
    }
    // Le courant gère son propre système de navigation. Il faut l'activer si le système de navigation courant est actif. On ne désactive pas le système de navigation via la tabulation pour pouvoir sortir de l'enfant avec la touche Tab
    childFocusManager.enableKeyNavigation();
    childFocusManager.giveFocus();
  }
  /** @override */
  removeCurrent() {
    // Le composant que l'on quitte ne doit plus avoir son propre système de navigation actif s'il l'était
    this.getAccessibleChildFocusManager()
      ?.disableKeyNavigation();

    super.removeCurrent();
  }
  /** @override */
  changeCurrent(index) {
    this.getAllComponents()
      .forEach(component => {
        const focusManager = component.getFocusManager();
        if (focusManager) {
          focusManager.updateCurrent(focusManager.getIndexCurrent());
        }
      });

    super.changeCurrent(index);
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

    this.getAccessibleChildFocusManager()
      ?.enableKeyNavigation();
  }
  /**
   * Désactive la navigation. La tabulation ne pourra jamais accéder aux composants gérés par le focusManager
   */
  disableKeyNavigation() {
    super.disableKeyNavigation();

    this.getAccessibleChildFocusManager()
      ?.disableKeyNavigation();
  }

  /**
   * Récupère l'enfant dont le système de focus doit être également actif en même temps que son parent
   */
  getAccessibleChildFocusManager() {
    const childFocusManager = this.getChildFocusManager();
    if (!childFocusManager) {
      return null;
    }
    if (childFocusManager.pressEnterToAccess()) {
      return null;
    }
    return childFocusManager;
  }

}
export default CompositeFocusManager;