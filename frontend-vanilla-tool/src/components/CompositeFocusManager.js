import FocusManager from './FocusManager.js';

/** Désigne des systèmes de navigation composés d'autre système de navigation. Par exemple, on peut naviguer d'un composant à l'autre avec la tabulation et dans un composant avec les flèches */
class CompositeFocusManager extends FocusManager {

  name = 'CompositeFocusManager';

  /*
   * Positionnement du courant : gérer le système de navigation de l'enfant courant
   * --------------------------------------------------------------------------------
   */
  /** @override */
  setCurrent(component) {
    super.setCurrent(component);

    if (!this.isNavigationActive() || this.isControlChildNavigation()) {
      // Ne rien fait si la navigation n'est pas active ou si le parent contrôle la navigation de l'enfant
      return;
    }

    const childFocusManager = this.getAccessibleChildFocusManager();
    if (childFocusManager) {
      // Lorsque l'on arrive sur un composant enfant, son système de navigation doit être activé. Cela permet de naviguer dans le composant. Pour pouvoir quitter le composant, il faut que le système de navigation parent reste actif. Ainsi, une navigation parente avec Tab s'occupera de passer d'un composant à l'autre, les flèches permettront de naviguer dans le composant
      childFocusManager.enableKeyNavigation();
      childFocusManager.giveFocus();
    }
  }
  /** @override */
  removeCurrent() {
    if (!this.isNavigationActive() || this.isControlChildNavigation()) {
      super.removeCurrent();
      return;
    }

    // Lorsque l'on quitte le composant enfant, son système de navigation doit être désactivé
    this.getAccessibleChildFocusManager()
      ?.disableKeyNavigation();

    super.removeCurrent();
  }
  /** @override */
  changeCurrent(index) {
    // Bien penser à mettre à jour les enfants au cas où une activation/désactivation/visibilité ait changé
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
   * Active la navigation via le clavier. La tabulation pourra accéder à la zone et les touches du clavier seront écoutées
   */
  enableKeyNavigation() {
    super.enableKeyNavigation();

    const childFocusManager = this.getAccessibleChildFocusManager();
    if (!childFocusManager) {
      return;
    }
    // lorsque l'on est positionné sur un enfant qui gère son propre système de navigation, le focus doit aller sur le courat de cet enfant et non pas sur le courant du parent
    this.getCurrent()
      .setTabIndex(-1);

    if (this.isControlChildNavigation()) {
      // Le parent gère la navigation, mais la tabulation doit se positionner sur le courant de l'enfant
      childFocusManager.getCurrent()
        ?.setTabIndex(0);
    } else {
      childFocusManager.enableKeyNavigation();
    }
  }
  /**
   * Désactive la navigation. La tabulation ne pourra jamais accéder aux composants gérés par le focusManager
   */
  disableKeyNavigation() {
    super.disableKeyNavigation();

    if (!this.isControlChildNavigation()) {
      this.getAccessibleChildFocusManager()
        ?.disableKeyNavigation();
    }
  }

  /**
   * Récupère l'enfant dont le système de focus doit être également actif en même temps que son parent
   */
  getAccessibleChildFocusManager() {
    const childFocusManager = this.getChildFocusManager();
    if (!childFocusManager) {
      return null;
    }
    // Si on doit taper la touche Entrée pour entrer dans le composant enfant alors la navigation de ce dernier n'est pas géré par son parent
    if (childFocusManager.pressEnterToAccess()) {
      return null;
    }
    return childFocusManager;
  }

}
export default CompositeFocusManager;