import FocusManager from './FocusManager.js';

/** Désigne des systèmes de navigation composés d'autre système de navigation. Par exemple, on peut naviguer d'un composant à l'autre avec la tabulation et dans un composant avec les flèches */
class CompositeFocusManager extends FocusManager {

  name = 'CompositeFocusManager';

  /*
   * Positionnement du courant : gérer le système de navigation de l'enfant courant
   * --------------------------------------------------------------------------------
   */
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
   * Prise de focus
   * ---------------------------------------------------
   */
  isFocusable(component) {
    const childFocusManager = component.getFocusManager();
    if (childFocusManager && !childFocusManager.hasFocusable()) {
      return false;
    }
    return super.isFocusable(component);
  }

}
export default CompositeFocusManager;