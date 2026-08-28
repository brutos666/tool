import DOMUtilities from '../tools/DOMUtilities.js';
/** @import Component from './Component.js'; */

class FocusManager {

  name = 'FocusManager';

  #keyEvent = {
    // Lorsque la tabulation doit permettre de naviguer et surtout ne pas sortir de la zone
    Tab: this.#onKeyTab.bind(this),
    // Lorsque que l'on peut "entrer" dans un des éléments pour entamer une navigation à l'intérieur de celui-ci
    Enter: this.#onKeyEnter.bind(this),
    Escape: this.#onKeyEscape.bind(this),
    // Les flèches sont nécessaires pour naviguer entre les différentes éléments
    ArrowUp: this.focusToDirection.bind(this, 'Up'),
    ArrowDown: this.focusToDirection.bind(this, 'Down'),
    ArrowLeft: this.focusToDirection.bind(this, 'Left'),
    ArrowRight: this.focusToDirection.bind(this, 'Right'),
    Home: this.giveFocusToFirst.bind(this),
    End: this.giveFocusToLast.bind(this)
  };
  #onKeyDownEvent = this.onKeyDown.bind(this);
  #onMouseDownEvent = this.#onMouseDown.bind(this);

  /** @type {FocusManager} */
  #parentFocusManager = null;
  /** @type {Component} */
  #current = null;
  /** @type {HTMLElement} */
  #container = null;
  /** @type {Component} */
  #parent = null;
  /** @type {Array<Component>} */
  #components = [];
  /** @type {boolean} */
  #navigationActive = false;

  /** @type {'horizontal'|'vertical'} */
  #orientation = 'horizontal';

  #canTab = false;
  #enterToAccess = false;
  #isInside = false;

  // Méthode appelée avant l'entrée dans un composant. Se positionne au système de navigation racine
  #callBeforeEnter = () => { return true; };

  /**
   * @constructor
   * @param {HTMLElement} container : conteneur des éléments
   * @param {'horizontal'|'vertical'} orientation : déplacement horizontal ou vertical
   * @param {boolean} enterToAccess : indique si la navigation peut-être activée en tapant sur la touche Entrée
   */
  constructor(container, orientation, enterToAccess) {
    this.#container = container;
    this.#orientation = orientation;
    this.#enterToAccess = enterToAccess;
    if (enterToAccess) {
      this.setOut();
    }
  }
  /** Paramétrages par défaut */
  allowFocusToDisabled() {
    return false;
  }
  isControlChildNavigation() {
    return false;
  }

  getContainer() {
    return this.#container;
  }
  setContainer(container) {
    this.#container = container;
  }

  /**
   * Positionne le parent si besoin
   * @param {Component} parent : parent
   */
  setParentComponent(parent) {
    this.#parent = parent;
    this.setCurrentFirstFocusable();
  }
  getParentComponent() {
    return this.#parent;
  }

  /*
   * Entrée et sortie d'un système de navigation par les touches Entrée/Escape
   * -------------------------------------------------------------------------
   */
  pressEnterToAccess() {
    return this.#enterToAccess;
  }
  canEnter() {
    return this.getAccessEnterFocusManager();
  }

  setIn() {
    this.#isInside = true;
    this.getContainer()
      .setAttribute('aria-description', 'Navigation active. Échap pour quitter.');
    this.getContainer()
      .classList.add('inside');
    this.getContainer()
      .classList.remove('outside');
  }
  setOut() {
    this.#isInside = false;
    this.getContainer()
      .setAttribute('aria-description', 'Entrée pour activer la navigation.');
    this.getContainer()
      .classList.remove('inside');
    this.getContainer()
      .classList.add('outside');
  }
  isInside() {
    return this.#isInside;
  }

  enter() {
    const wasInside = this.isInside();
    const focusManager = this.giveControlToInside();
    focusManager.giveFocus();
    if (wasInside) {
      this.setIn();
    }
  }
  exit() {
    const parentFocusManager = this.giveControlToParent();
    parentFocusManager.giveFocus();
  }

  /*
   * Composants pouvant prendre le focus par les touches du clavier ou un clic de la souris
   * -------------------------------------------------------------------------------------------
   */
  /**
   * Ajout d'un élément focusable
   * @param {Component} component
   */
  addComponent(component) {
    this.addComponentAt(this.#components.length, component);
  }
  addComponentAt(index, component) {
    this.#components.splice(index, 0, component);
    if (!component.getFocusManager()) {
      component.setTabIndex(-1);
    }
    component.getView()
      .addEventListener('mousedown', this.#onMouseDownEvent);
    component.getFocusManager()
      ?.setParentFocusManager(this);

    if (this.#parent && !this.#current) {
      this.setCurrent(component);
    }
  }
  removeComponent(index) {
    const component = this.#components[index];
    this.disableComponentFocus(component);
    this.#components.splice(index, 1);
    if (this.getCurrent() !== component) {
      return;
    }
    // Mettre à jour le nouveau courant
    this.changeCurrent(index);
  }
  removeComponents(components) {
    for (const component of components) {
      const index = this.#components.findIndex(comp => comp === component);
      this.disableComponentFocus(component);
      this.#components.splice(index, 1);
    }
  }
  removeAllComponents() {
    // Le courant n'est plus accessible : désactiver le système de navigation courant
    this.changeParentCurrent();
    this.removeCurrent();
    for (const component of this.#components) {
      this.disableComponentFocus(component);
    }
    this.#components = [];
  }
  disableComponentFocus(component) {
    component.removeTabIndex();
    component.getView()
      .removeEventListener('mousedown', this.#onMouseDownEvent);
    component.getFocusManager()
      ?.setParentFocusManager(null);
  }
  getAllComponents() {
    return this.#components;
  }
  getComponentAt(index) {
    return this.#components[index];
  }
  getFirstFocusable() {
    return this.#components.find(component => this.isFocusable(component));
  }
  getLastFocusable() {
    return this.#components.toReversed()
      .find(component => this.isFocusable(component));
  }
  getLastFocusableBefore(beforeIndex) {
    for (let i = beforeIndex - 1; i >= 0; i--) {
      const component = this.#components[i];
      if (this.isFocusable(component)) {
        return component;
      }
    }
    return null;
  }
  getFirstFocusableAfter(afterIndex) {
    for (let i = afterIndex + 1; i < this.#components.length; i++) {
      const component = this.#components[i];
      if (this.isFocusable(component)) {
        return component;
      }
    }
    return null;
  }

  /*
   * Démarrage/Arrêt de la navigation au clavier
   * --------------------------------------------------
   */

  /**
   * Active la navigation via le clavier.
   * Écoute les touches du clavier. Positionne le tabindex pour que la tabulation puisse accéder à la zone.
   *
   * Le système de navigation parent peut piloter la navigation (ColumnFocusManager) ou peut fonctionner simultanément avec
   * le système de navigation enfant (TabFocusManager) avec des touches pour passer d'un composant à un autre et d'autres
   * touches pour naviguer à l'intérieur du composant
   */
  enableKeyNavigation() {
    if (this.isParentControlNavigation() || this.isParentNavigateWithThis()) {
      this.getParentFocusManager()
        .enableKeyNavigation();
      return;
    }

    this.setNavigationActive(true);
    this.enableCurrentKeyNavigation();
  }
  /**
   * Désactive la navigation.
   *
   * Le système de navigation parent peut piloter la navigation (ColumnFocusManager) ou peut fonctionner simultanément avec
   * le système de navigation enfant (TabFocusManager) avec des touches pour passer d'un composant à un autre et d'autres
   * touches pour naviguer à l'intérieur du composant
   */
  disableKeyNavigation() {
    if (this.isParentControlNavigation() || this.isParentNavigateWithThis()) {
      this.getParentFocusManager()
        .disableKeyNavigation();
      return;
    }

    this.setNavigationActive(false);
    if (this.isInside()) {
      this.setOut();
    }
    this.disableCurrentKeyNavigation();
  }
  disableNavigationForAll() {
    this.disableKeyNavigation();
    const accessEnterFocusManager = this.getAccessEnterFocusManager();
    accessEnterFocusManager?.disableNavigationForAll();
  }
  /**
   * Écoute les touches du clavier. Positionne le tabindex pour que la tabulation puisse accéder à la zone.
   */
  enableCurrentKeyNavigation() {
    const current = this.getCurrent();
    if (!current) {
      return;
    }
    this.listenKeys(current);

    const currentFocusManager = this.getCurrentFocusManager();
    if (currentFocusManager) {
      // Lorsque l'on arrive sur un composant enfant, son système de navigation doit être activé. Cela permet de naviguer dans le composant. Pour pouvoir quitter le composant, il faut que le système de navigation parent reste actif. Ainsi, une navigation parente avec Tab s'occupera de passer d'un composant à l'autre, les flèches permettront de naviguer dans le composant
      currentFocusManager.setNavigationActive(this.isNavigationActive());
      currentFocusManager.enableCurrentKeyNavigation();
      return;
    }
    current.setTabIndex(0);
  }
  /**
   * Arrêt de l'écoute des touches du clavier. Positionne le tabindex pour que la tabulation ne puisse plus accéder à la zone.
   */
  disableCurrentKeyNavigation() {
    const current = this.getCurrent();
    if (!current) {
      return;
    }
    this.stopListenKeys(current);

    const currentFocusManager = this.getCurrentFocusManager();
    if (currentFocusManager) {
      currentFocusManager.setNavigationActive(this.isNavigationActive());
      currentFocusManager.disableCurrentKeyNavigation();
      return;
    }
    current.setTabIndex(-1);
  }

  isNavigationActive() {
    return this.#navigationActive;
  }
  setNavigationActive(active) {
    this.#navigationActive = active;
  }
  hasNavigationActive() {
    return this.#navigationActive || this.getCurrent()
      ?.getFocusManager()
      ?.hasNavigationActive();
  }

  isParentControlNavigation() {
    if (this.pressEnterToAccess()) {
      return false;
    }
    const parentFocusManager = this.getParentFocusManager();
    return parentFocusManager?.isControlChildNavigation();
  }
  isParentNavigateWithThis() {
    if (this.pressEnterToAccess()) {
      return false;
    }
    const parentFocusManager = this.getParentFocusManager();
    if (!parentFocusManager || parentFocusManager.isControlChildNavigation()) {
      return false;
    }
    return parentFocusManager.getCurrentFocusManager() === this;
  }

  listenKeys(component) {
    if (this.isParentControlNavigation()) {
      // Les touches du claviers sont écoutées par le parent
      return;
    }
    setTimeout(() => {
      // Astuce pour que l'écoute ne soit pas prise en compte lorsque l'appui sur une touche est en cours
      component.getView()
        .addEventListener('keydown', this.#onKeyDownEvent);
    }, 0);
  }
  stopListenKeys(component) {
    if (this.isParentControlNavigation()) {
      // Les touches du claviers sont écoutées par le parent
      return;
    }
    component.getView()
      .removeEventListener('keydown', this.#onKeyDownEvent);
  }

  /*
   * Orientation horizontale ou verticale et tabulation
   * --------------------------------------------------
   */
  changeOrientation(orientation) {
    this.#orientation = orientation;
  }
  isHorizontal() {
    return this.#orientation === 'horizontal';
  }
  isVertical() {
    return this.#orientation === 'vertical';
  }
  listenTabKey(tabulation) {
    this.#canTab = tabulation;
  }

  /*
   * Prise de focus
   * ---------------------------------------------------
   */
  giveFocusTo(component) {
    this.setCurrent(component);
    this.giveFocus();
  }
  giveFocus() {
    const currentFocusManager = this.getCurrentFocusManager();
    if (currentFocusManager) {
      currentFocusManager.giveFocus();
    } else {
      this.getCurrent()
        .giveFocus();
    }
  }
  isCurrentFocused() {
    return this.getCurrent()
      ?.isFocused();
  }
  isCurrentHasFocused() {
    const current = this.getCurrent();
    if (!current) {
      return false;
    }
    if (current.isFocused()) {
      return true;
    }
    const childFocusManager = current.getFocusManager();
    if (!childFocusManager) {
      return false;
    }
    if (childFocusManager.getAllComponents()
      .find(component => component.isFocused())) {
      return true;
    }
    return childFocusManager
      ?.isCurrentHasFocused();
  }

  giveFocusToFirst() {
    const firstFocusable = this.getFirstFocusable();
    if (firstFocusable) {
      this.giveFocusTo(firstFocusable);
    }
  }
  giveFocusToLast() {
    const lastFocusable = this.getLastFocusable();
    if (lastFocusable) {
      this.giveFocusTo(lastFocusable);
    }
  }
  focusToDirection(direction) {
    const indexCurrent = this.getIndexCurrent();
    let nextFocusable = null;
    if ([ 'Up', 'Left' ].includes(direction)) {
      nextFocusable = this.getLastFocusableBefore(indexCurrent);
    } else if ([ 'Down', 'Right' ].includes(direction)) {
      nextFocusable = this.getFirstFocusableAfter(indexCurrent);
    }
    if (nextFocusable) {
      this.giveFocusTo(nextFocusable);
      return true;
    }
    return false;
  }
  isFocusable(component) {
    if (!this.allowFocusToDisabled() && component.isDisabled()) {
      return false;
    }
    if (!this.#components.includes(component)) {
      return false;
    }
    return !DOMUtilities.hasHiddenClass(component.getElementView());
  }
  hasFocusable() {
    // Le fait d'avoir un courant doit indiquer que
    return this.#components.find(component => this.isFocusable(component));
  }

  /*
   * Positionnement du courant
   * ---------------------------------------------------
   */
  setCurrent(component) {
    if (this.#current === component) {
      return;
    }
    this.removeCurrent();
    this.#current = component;
    if (this.isNavigationActive()) {
      this.enableCurrentKeyNavigation();
    } else {
      this.disableCurrentKeyNavigation();
    }
  }
  removeCurrent() {
    this.disableCurrentKeyNavigation();
    this.#current = null;
  }
  /**
   * Retourne le composant courant
   * @returns {Component}
   */
  getCurrent() {
    return this.#current;
  }
  /**
   * Retourne le composant "feuille".
   * Dans le cas de systèmes de navigations imbriqués, on recherche le composant enfant qui prendra le focus
   * @returns {Component}
   */
  getCurrentLeaf() {
    const currentFocusManager = this.getCurrentFocusManager();
    if (currentFocusManager) {
      return currentFocusManager.getCurrentLeaf();
    }
    return this.getCurrent();
  }
  getIndexCurrent() {
    return this.#components.indexOf(this.getCurrent());
  }
  setCurrentWithIndex(index) {
    this.setCurrent(this.#components[index]);
  }
  setCurrentFirstFocusable() {
    const firstFocusable = this.getFirstFocusable();
    if (firstFocusable) {
      this.setCurrent(firstFocusable);
      return true;
    }
    return false;
  }
  setCurrentNextFocusable(index) {
    let nextFocusable = this.getFirstFocusableAfter(index);
    if (!nextFocusable) {
      nextFocusable = this.getLastFocusableBefore(index);
    }
    if (nextFocusable) {
      this.setCurrent(nextFocusable);
      return true;
    }
    return false;
  }
  setCurrentBranch(target) {
    for (const component of this.#components) {
      const element = component.getElementView();
      if (element === target || element.contains(target)) {
        this.setCurrent(component);
        break;
      }
    }
    const parentFocusManager = this.getParentFocusManager();
    parentFocusManager?.setCurrentBranch(target);

    if (!this.pressEnterToAccess()) {
      return;
    }
    // Si clic dans la zone alors on entre dedans.
    const rootFocusManager = this.getRootFocusManager();
    rootFocusManager.callBeforeEnter(parentFocusManager.getCurrent());
    this.setIn();
  }

  /**
   * Met à jour le courant lorsque un composant devient accessible ou inaccessible
   * @param currentIndexBeforeRemove - Index du courant avant sa suppression de la liste des composants. Lorsqu'il n'est pas fourni, c'est que le courant est toujours présent et sa position sera recherchée si besoin
   */
  refreshCurrent() {
    if (DOMUtilities.hasHiddenClass(this.getContainer())) {
      return;
    }
    this.changeCurrent();
  }
  changeCurrent(index) {
    let newFocusManager = this;
    const activeFocusManager = this.getActiveFocusManager();
    const activeWasFocused = activeFocusManager?.isCurrentHasFocused();
    const found = this.updateCurrent(index || this.getIndexCurrent());
    if (!found) {
      // Si plus rien n'est accessible, on voit le plus proche accessible en remontant les parents
      newFocusManager = this.#updateCurrentParents();
    }
    if (!activeWasFocused) {
      return;
    }
    if (activeFocusManager !== newFocusManager) {
      activeFocusManager.giveControlToFocusManager(newFocusManager);
    }
    newFocusManager.giveFocus();
  }
  changeParentCurrent() {
    const activeFocusManager = this.getActiveFocusManager();
    const activeWasFocused = activeFocusManager?.isCurrentHasFocused();
    const newFocusManager = this.#updateCurrentParents();
    if (!activeWasFocused) {
      return;
    }
    activeFocusManager.giveControlToFocusManager(newFocusManager);
    newFocusManager.giveFocus();
  }

  /**
   * Mise à jour du courant dans le système de navigation
   * @param currentIndex - position du courant dans la liste
   * @returns true si un courant accessible a pu être trouvé
   */
  updateCurrent(currentIndex) {
    const current = this.getCurrent();
    if (current) {
      if (this.isFocusable(current)) {
        return true;
      }
      // Recherche du plus proche courant accessible
      return this.setCurrentNextFocusable(currentIndex);
    }
    return this.setCurrentFirstFocusable();
  }
  /**
   * Mise à jour du courant des parents jusqu'à trouver un courant accessible
   */
  #updateCurrentParents() {
    const parentFocusManager = this.getParentFocusManager();
    if (!parentFocusManager) {
      return this;
    }
    const found = parentFocusManager.updateCurrent(parentFocusManager.getIndexCurrent());
    if (found) {
      return parentFocusManager;
    }
    return parentFocusManager.#updateCurrentParents();
  }

  /*
   * Navigation au clavier
   * ---------------------
   */
  interceptKeys() {
    const keys = [ 'Home', 'End' ];
    if (this.isInside()) {
      keys.push('Escape');
    }
    if (this.canEnter()) {
      keys.push('Enter');
    }

    if (this.#canTab) {
      keys.push('Tab');
    }
    if (this.#orientation === 'vertical') {
      keys.push('ArrowUp');
      keys.push('ArrowDown');
    } else {
      keys.push('ArrowLeft');
      keys.push('ArrowRight');
    }
    return keys;
  }

  /**
   * Méthode appelée lors de l'appui sur une touche de clavier
   * @param {Event} event - Event de clavier
   */
  onKeyDown(event) {
    if (!this.getCurrent()) {
      return;
    }

    if (!this.interceptKeys()
      .includes(event.key)) {
      return;
    }
    event.preventDefault();
    this.#keyEvent[event.key]?.(event);
  }

  #onKeyTab(event) {
    if (!this.focusToDirection(event.shiftKey ? 'Up' : 'Down')) {
      // Boucler
      if (event.shiftKey) {
        this.giveFocusToLast();
      } else {
        this.giveFocusToFirst();
      }
    }
  }
  /** Entrée et sortie dans un autre système de navigation **/
  #onKeyEnter() {
    const accessEnterFocusManager = this.getAccessEnterFocusManager();
    if (!accessEnterFocusManager?.hasFocusable()) {
      return;
    }
    const controlCurrent = this.getControlCurrentFocusManager();
    // Alerte le composant si besoin et ne fait pas la suite si le composant empêche l'entrée
    const doEnter = this.getRootFocusManager()
      .callBeforeEnter(controlCurrent.getCurrent());
    if (doEnter) {
      this.enter();
    }
  }
  #onKeyEscape() {
    this.exit();
  }

  /*
   * Prise de focus par la souris
   * ---------------------------------------------------
   */
  #onMouseDown(event) {
    if (!this.hasFocusable()) {
      return;
    }
    // Exclure les boutons notamment l'ouverture des noeuds
    if (event.target.closest('button')) {
      event.stopPropagation();
      return;
    }
    this.changeFocus(event.currentTarget);
    event.stopPropagation();
  }
  changeFocus(component) {
    // Si nous sommes dans un arbre de focusManager, il faut désactiver les autres focusManager des vues courantes avant de positionner le nouvel élément courant
    const rootFocusManager = this.getRootFocusManager();
    rootFocusManager.disableNavigationForAll();
    // Positionner le courant pour chaque noeud de l'arbre. S'il s'agit d'une zone dans laquelle on peut entrée et sortie (Entrée/Escape), on appelle la fonction avant Entrée.
    this.setCurrentBranch(component);

    // Activer le système de navigation
    this.enableKeyNavigation();
  }

  /*
   * Systèmes de navigation
   * ---------------------------------------------------
   */
  setParentFocusManager(parentFocusManager) {
    this.#parentFocusManager = parentFocusManager;
  }
  getParentFocusManager() {
    return this.#parentFocusManager || this.getParentComponent()
      ?.getFocusManager();
  }
  /**
   * Retourne le système de navigation racine
   * @returns {FocusManager} système de navigation racine
   */
  getRootFocusManager() {
    const parent = this.getParentFocusManager();
    if (parent) {
      return parent.getRootFocusManager();
    }
    return this;
  }
  /**
   * Retourne le système de navigation du composant courant accessible via la touche Enter
   * @returns {FocusManager} focusManager du composant accessible via la touche Enter
   */
  getAccessEnterFocusManager() {
    const currentFocusManager = this.getCurrentFocusManager();
    if (currentFocusManager) {
      return currentFocusManager.getAccessEnterFocusManager();
    }
    const childFocusManager = this.getCurrent()
      ?.getFocusManager();
    if (childFocusManager?.pressEnterToAccess()) {
      return childFocusManager;
    }
    return null;
  }
  /**
   * Retourne le système de navigation du composant courant accessible sans avoir à entrer dedans avec la touche Enter
   * @returns {FocusManager} système de navigation du composant courant
   */
  getCurrentFocusManager() {
    const currentFocusManager = this.getCurrent()
      ?.getFocusManager();
    if (currentFocusManager && !currentFocusManager.pressEnterToAccess()) {
      return currentFocusManager;
    }
    return null;
  }
  /**
   * Fournit le système de navigation actif dans la branche courante
   * @returns {FocusManager}
   */
  getActiveFocusManager() {
    if (this.isNavigationActive()) {
      return this;
    }
    const currentFocusManager = this.getCurrent()
      ?.getFocusManager();
    if (!currentFocusManager) {
      return null;
    }
    return currentFocusManager.getActiveFocusManager();
  }
  /**
   * Retourne le système de navigation qui s'occupe de la navigation pour le composant courant
   * @returns {FocusManager} système de navigation
   */
  getControlCurrentFocusManager() {
    const currentFocusManager = this.getCurrent()
      ?.getFocusManager();
    if (!currentFocusManager || currentFocusManager.pressEnterToAccess()) {
      return this;
    }
    if (currentFocusManager.isParentControlNavigation()) {
      return currentFocusManager.getControlCurrentFocusManager();
    }
    return this;
  }
  /**
   * Parcours des parents jusqu'à trouver un parent pouvant avoir le focus
   * @returns {FocusManager} système de navigation du 1er parent avec un courant
   */
  getFocusableParentFocusManager() {
    const parentFocusManager = this.getParentFocusManager();
    while (parentFocusManager) {
      if (parentFocusManager.hasFocusable()) {
        return parentFocusManager;
      }
    }
    return null;
  }

  /*
   * Gestion du contrôle de la navigation
   * ---------------------------------------------------
   */
  /**
   * Donne le contrôle au focusManager parent
   * @returns {FocusManager} focusManager parent
   */
  giveControlToParent() {
    const parentFocusManager = this.getParentFocusManager();
    if (!parentFocusManager) {
      return null;
    }
    this.giveControlToFocusManager(parentFocusManager);
    return parentFocusManager;
  }
  giveControlToInside() {
    const accessEnterFocusManager = this.getAccessEnterFocusManager();
    if (!accessEnterFocusManager) {
      return;
    }
    accessEnterFocusManager.setIn();
    this.giveControlToFocusManager(accessEnterFocusManager);
    return accessEnterFocusManager;
  }

  /**
   * Donne le contrôle au focusManager précisé en entrée
   * @param {FocusManager} focusManager
   */
  giveControlToFocusManager(focusManager) {
    this.disableKeyNavigation();
    focusManager.enableKeyNavigation();
  }

  /*
   * Méthode appelée avec l'entrée dans un composant. Peut empêcher l'entrée dans le composant
   * -----------------------------------------------------------------------------------------
   */
  setCallbackBeforeEnter(callBeforeEnter) {
    this.#callBeforeEnter = callBeforeEnter;
  }
  callBeforeEnter(current) {
    return this.#callBeforeEnter(current);
  }

}

export default FocusManager;
