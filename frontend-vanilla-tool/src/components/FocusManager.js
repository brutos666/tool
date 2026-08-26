import DOMUtilities from '../tools/DOMUtilities.js';
import CompositeFocusManager from './CompositeFocusManager.js';
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
    return this.getChildFocusManager()
      ?.pressEnterToAccess();
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

    const focusManager = this.giveControlToCurrent();
    focusManager.giveFocus();
    focusManager.setIn();

    if (wasInside) {
      this.setIn();
    }
  }
  exit() {
    this.setOut();
    const parentFocusManager = this.giveControlToParent();
    parentFocusManager.giveFocus();
  }

  /*
   * Vues et élément pouvant prendre le focus par les touches du clavier ou un clic de la souris
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
    component.setTabIndex(-1);
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
  removeGivenComponent(component) {
    const index = this.getAllComponents()
      .findIndex(comp => comp === component);
    if (index === -1) {
      return;
    }
    this.removeComponent(index);
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
   * Active la navigation via le clavier. La tabulation pourra accéder à la zone.
   */
  enableKeyNavigation() {
    this.#navigationActive = true;
    const current = this.getCurrent();
    if (!current) {
      return;
    }

    current.setTabIndex(0);
    setTimeout(() => {
      // Astuce pour que l'écoute ne soit pas prise en compte lorsque l'appui sur une touche est en cours
      current.getView()
        .addEventListener('keydown', this.#onKeyDownEvent);
    }, 0);
  }
  /**
   * Désactive la navigation. La tabulation ne pourra jamais accéder aux composants gérés par le focusManager
   */
  disableKeyNavigation() {
    this.#navigationActive = false;
    if (this.isInside()) {
      this.setOut();
    }
    const current = this.getCurrent();
    if (!current) {
      return;
    }

    current.setTabIndex(-1);
    current.getView()
      .removeEventListener('keydown', this.#onKeyDownEvent);
  }
  disableNavigationForAll() {
    this.disableKeyNavigation();
    const childFocusManager = this.getChildFocusManager();
    childFocusManager?.disableNavigationForAll();
  }
  isNavigationActive() {
    return this.#navigationActive;
  }
  hasNavigationActive() {
    return this.#navigationActive || this.getChildFocusManager()
      ?.hasNavigationActive();
  }
  isParentControlNavigation() {
    if (this.pressEnterToAccess()) {
      return false;
    }
    const parentFocusManager = this.getParentFocusManager();
    return parentFocusManager?.isControlChildNavigation();
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
  giveFocus() {
    this.getCurrent()
      .giveFocus();
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
      this.setCurrent(firstFocusable);
      this.giveFocus();
    }
  }
  giveFocusToLast() {
    const lastFocusable = this.getLastFocusable();
    if (lastFocusable) {
      this.setCurrent(lastFocusable);
      this.giveFocus();
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
      this.setCurrent(nextFocusable);
      this.giveFocus();
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
    this.removeCurrent();
    const isNavigationActive = this.isNavigationActive();
    if (isNavigationActive) {
      component.setTabIndex(0);
      component.getView()
        .addEventListener('keydown', this.#onKeyDownEvent);
    } else {
      component.setTabIndex(-1);
    }
    this.#current = component;
  }
  removeCurrent() {
    const current = this.getCurrent();
    if (!current) {
      return;
    }
    current.setTabIndex(-1);
    current.getView()
      .removeEventListener('keydown', this.#onKeyDownEvent);
    this.#current = null;
  }
  /**
   * Retourne le composant courant
   * @returns {Component}
   */
  getCurrent() {
    return this.#current;
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
    if (!this.getChildFocusManager()
      ?.hasFocusable()) {
      return;
    }
    // Alerte le composant si besoin et ne fait pas la suite si le composant empêche l'entrée
    const doEnter = this.getRootFocusManager()
      .callBeforeEnter(this.getCurrent());
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
    if (this.isInside()) {
      this.enableKeyNavigation();
      return;
    }
    // NOTE : Des systèmes de navigation via des flèches peuvent être pilotés par un système plus global via tabulation. Ainsi, on naviguera d'un composant à l'autre via Tab et à l'intérieur du composant via les flèches. Ainsi, pour un enfant d'un TabFocusManager, c'est le TabFocusManager qui pilote.
    const focusManagerToEnable = this.getParentFocusManager() instanceof CompositeFocusManager ? this.getParentFocusManager() : this;
    focusManagerToEnable.enableKeyNavigation();
  }

  /*
   * Gestion du contrôle de la navigation
   * ---------------------------------------------------
   */
  setParentFocusManager(parentFocusManager) {
    this.#parentFocusManager = parentFocusManager;
  }
  getParentFocusManager() {
    return this.#parentFocusManager || this.getParentComponent()
      ?.getFocusManager();
  }
  getChildFocusManager() {
    return this.getCurrent()
      ?.getFocusManager();
  }
  /**
   * Parcours des parents jusqu'à trouver un parent pouvant avoir le focus
   * @returns focusManager du 1er parent avec un courant
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
  /**
   * Fournit le système de navigation enfant qui est actif
   * @returns {FocusManager}
   */
  getActiveFocusManager() {
    if (this.isNavigationActive()) {
      return this;
    }
    const childFocusManager = this.getChildFocusManager();
    if (!childFocusManager) {
      return null;
    }
    return childFocusManager.getActiveFocusManager();
  }

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
  giveControlToCurrent() {
    if (!this.getChildFocusManager()) {
      return;
    }
    const childFocusManager = this.getChildFocusManager();
    this.giveControlToFocusManager(childFocusManager);
    return childFocusManager;
  }

  /**
   * Donne le contrôle au focusManager précisé en entrée
   * @param {FocusManager} focusManager
   */
  giveControlToFocusManager(focusManager) {
    this.disableKeyNavigation();
    if (focusManager.isParentControlNavigation()) {
      focusManager.getParentFocusManager()
        .enableKeyNavigation();
    } else {
      focusManager.enableKeyNavigation();
    }
  }

  /**
   * Retourne le focusManager racine
   * @returns {FocusManager} focusManager racine
   */
  getRootFocusManager() {
    const parent = this.getParentFocusManager();
    if (parent) {
      return parent.getRootFocusManager();
    }
    return this;
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
