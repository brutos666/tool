import CompositeFocusManager from './CompositeFocusManager.js';
/** @import FocusManager from './FocusManager.js'; */

/**
 * Cette classe s'occupe des systèmes de navigation empilés. C'est le cas lorsqu'une barre d'outils permet l'accès à un autre système de navigation
 */
class PopupFocusManager extends CompositeFocusManager {

  name = 'PopupFocusManager';

  #componentToAccess;
  #isInsideComponent = false;

  /**
   * @constructor
   * @param {HTMLElement} container : conteneur des éléments
   * @param {'horizontal'|'vertical'} orientation : déplacement horizontal ou vertical
   * @param {boolean} enterToAccess : indique si la navigation peut-être activée en tapant sur la touche Entrée
   */
  constructor(container, orientation, enterToAccess) {
    super(container, orientation, enterToAccess);
  }

  setComponentToAccess(component) {
    this.#componentToAccess = component;
    component.getFocusManager()
      .setParentFocusManager(this);
  }

  accessToComponent() {
    /** @type {FocusManager} */
    const focusManager = this.#componentToAccess.getFocusManager();
    focusManager.changeFocus(focusManager.getCurrent()
      .getElementView());
    focusManager.giveFocus();
    this.#isInsideComponent = true;
  }
  /** @override */
  enableKeyNavigation() {
    this.#isInsideComponent = false;

    super.enableKeyNavigation();
  }
  /** @override */
  disableKeyNavigation() {
    this.#isInsideComponent = false;

    super.disableKeyNavigation();

    /** @type {FocusManager} */
    const focusManager = this.#componentToAccess.getFocusManager();
    focusManager.disableKeyNavigation();
  }
  /** @override */
  getCurrent() {
    if (this.#isInsideComponent) {
      return this.#componentToAccess;
    }
    return super.getCurrent();
  }

}
export default PopupFocusManager;