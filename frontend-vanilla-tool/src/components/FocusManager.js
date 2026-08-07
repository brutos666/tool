import DOMUtilities from '../tools/DOMUtilities.js';
/** @import Component from './Component.js'; */

class FocusManager {

  #keyEvent = {
    // Lorsque la tabulation doit permettre de naviguer et surtout ne pas sortir de la zone
    Tab: this.onKeyTab.bind(this),
    // Lorsque que l'on peut "entrer" dans un des éléments pour entamer une navigation à l'intérieur de celui-ci
    Enter: this.#onKeyEnter.bind(this),
    Escape: this.#onKeyEscape.bind(this),
    // Les flèches sont nécessaires pour naviguer entre les différentes éléments
    ArrowUp: this.focusToDirection.bind(this, 'Up'),
    ArrowDown: this.focusToDirection.bind(this, 'Down'),
    ArrowLeft: this.focusToDirection.bind(this, 'Left'),
    ArrowRight: this.focusToDirection.bind(this, 'Right'),
    Home: this.#focusToFirst.bind(this),
    End: this.#focusToLast.bind(this)
  };
  #onKeyDownEvent = this.#onKeyDown.bind(this);
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
  #focusable = [];
  /** @type {boolean} */
  #listened = false;

  /** @type {'horizontal'|'vertical'} */
  #orientation = 'horizontal';

  #canTab = false;
  #enterToAccess = false;
  #canExit = false;

  /**
   * @constructor
   * @param {HTMLElement} container : conteneur des éléments
   * @param {'horizontal'|'vertical'|'tree'} orientation : déplacement horizontal ou vertical ou arbre
   * @param {boolean} canTab : traite la tabulation en plus des flèches et garde la navigation à l'intérieur du conteneur
   * @param {boolean} enterToAccess : indique si la navigation peut-être activée en tapant sur la touche Entrée
   */
  constructor(container, orientation, canTab, enterToAccess) {
    this.#container = container;
    this.#orientation = orientation;
    this.#canTab = canTab;
    this.#enterToAccess = enterToAccess;
    if (enterToAccess) {
      this.setCanExit(false);
    }
  }

  getContainer() {
    return this.#container;
  }

  /**
   * Positionne le parent si besoin
   * @param {Component} parent : parent
   */
  setParentComponent(parent) {
    this.#parent = parent;
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

  setCanExit(canExit) {
    this.#canExit = canExit;

    const description = canExit ? 'Navigation active. Échap pour quitter.' : 'Entrée pour activer la navigation.';
    this.getContainer()
      .setAttribute('aria-description', description);
  }
  canExit() {
    return this.#canExit;
  }

  #enter() {
    if (!this.getChildFocusManager()) {
      return;
    }
    const focusManager = this.giveControlToCurrent();
    focusManager.setParentFocusManager(this);
    focusManager.setCanExit(true);
  }

  #exit() {
    if (!this.canExit()) {
      return;
    }
    const parentFocusManager = this.giveControlToParent();
    parentFocusManager.giveFocus();
    this.setCanExit(false);
  }

  /*
   * Vues et élément pouvant prendre le focus par les touches du clavier ou un clic de la souris
   * -------------------------------------------------------------------------------------------
   */

  /**
   * Ajout d'un élément focusable
   * @param {Component} component
   */
  addFocusable(component) {
    this.#focusable.push(component);
    component.setTabIndex(-1);
    component.getView()
      .addEventListener('mousedown', this.#onMouseDownEvent);
    if (this.#focusable.length === 1) {
      this.setCurrent(this.#focusable[0]);
    }
  }
  removeFocusable(index) {
    const component = this.#focusable[index];
    component.setTabIndex(null);
    component.getView()
      .removeEventListener('mousedown', this.#onMouseDownEvent);
    if (this.getCurrent() === component) {
      if (this.#focusable.length === 1) {
        this.removeCurrent();
      } else {
        this.setCurrent(this.#focusable[0]);
      }
    }
    this.#focusable.splice(index, 1);
  }
  removeAllFocusable() {
    this.removeCurrent();
    for (const component of this.#focusable) {
      component.getView()
        .removeEventListener('mousedown', this.#onMouseDownEvent);
    }
    this.#focusable = [];
  }
  getFocusableComponents() {
    return this.#focusable;
  }
  getFocusableAt(index) {
    return this.#focusable[index];
  }

  /*
   * Démarrage/Arrêt de la navigation au clavier
   * --------------------------------------------------
   */

  /**
   * Active la navigation via le clavier. La tabulation pourra accéder à la zone.
   */
  enableKeyNavigation() {
    this.#listened = true;
    this.getCurrent()
      ?.setTabIndex(0);
    setTimeout(() => {
      // Astuce pour que l'écoute ne soit pas prise en compte lorsque l'appui sur une touche est en cours
      this.#container.addEventListener('keydown', this.#onKeyDownEvent);
    }, 0);
  }
  /**
   * Désactive la navigation. La tabulation ne pourra jamais accéder aux composants gérés par le focusManager
   */
  disableKeyNavigation() {
    this.#listened = false;
    this.getCurrent()
      ?.setTabIndex(-1);
    this.#container.removeEventListener('keydown', this.#onKeyDownEvent);
  }
  disableNavigationForAll() {
    this.disableKeyNavigation();
    const childFocusManager = this.getChildFocusManager();
    childFocusManager?.disableNavigationForAll();
  }
  isListened() {
    return this.#listened;
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
   * Prise de focus et positionnement du courant
   * ---------------------------------------------------
   */
  giveFocus() {
    this.getCurrent()
      .giveFocus();
  }
  isCurrentFocused() {
    return this.getCurrent()
      .isFocused();
  }

  setCurrent(component) {
    this.removeCurrent();
    // Ne permettre la prise de focus que si le focusManager est à l'écoute
    component.setTabIndex(this.isListened() ? 0 : -1);
    this.#current = component;
  }
  setCurrentWithIndex(index) {
    this.setCurrent(this.#focusable[index]);
  }
  /**
   * Retourne le composant courant
   * @returns {Component}
   */
  getCurrent() {
    return this.#current;
  }
  /**
   * Retourne l'élément HTML du composant courant
   * @returns {HTMLElement}
   */
  getCurrentElement() {
    return this.getCurrent()
      .getElementView();
  }
  getIndexCurrent() {
    return this.#focusable.indexOf(this.getCurrent());
  }
  removeCurrent() {
    if (!this.#current) {
      return;
    }
    this.getCurrent()
      .setTabIndex(-1);
    this.#current = null;
  }
  setCurrentBranch(target) {
    for (const component of this.#focusable) {
      const element = component.getElementView();
      if (element === target || element.contains(target)) {
        this.setCurrent(component);
        break;
      }
    }
    this.getParentFocusManager()
      ?.setCurrentBranch(target);
  }

  /*
   * Navigation au clavier
   * ---------------------
   */
  interceptKeys() {
    if (DOMUtilities.isHidden(this.getCurrentElement())) {
      return [];
    }
    const keys = [ 'Home', 'End' ];
    if (this.canExit()) {
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
  #onKeyDown(event) {
    if (!this.interceptKeys()
      .includes(event.key)) {
      return;
    }
    event.preventDefault();
    this.#keyEvent[event.key]?.(event);
  }

  onKeyTab(event) {
    this.focusToDirection(event.shiftKey ? 'Up' : 'Down');
  }

  #focusToFirst() {
    this.setCurrent(this.#focusable[0]);
    this.giveFocus();
  }
  #focusToLast() {
    this.setCurrent(this.#focusable[this.#focusable.length - 1]);
    this.giveFocus();
  }

  focusToDirection(direction) {
    let indexCurrent = this.getIndexCurrent();
    if ([ 'Up', 'Left' ].includes(direction)) {
      indexCurrent--;
    } else if ([ 'Down', 'Right' ].includes(direction)) {
      indexCurrent++;
    }
    if (indexCurrent === this.#focusable.length) {
      indexCurrent = 0;
    } else if (indexCurrent === -1) {
      indexCurrent = this.#focusable.length - 1;
    }
    this.setCurrent(this.#focusable[indexCurrent]);
    if (DOMUtilities.isHidden(this.getCurrentElement())) {
      this.focusToDirection(direction);
    } else {
      this.giveFocus();
    }
  }

  /** Entrée et sortie dans un autre système de navigation **/
  #onKeyEnter() {
    this.#enter();
  }
  #onKeyEscape() {
    this.#exit();
  }

  /*
   * Prise de focus par la souris
   * ---------------------------------------------------
   */
  #onMouseDown(event) {
    const rootFocusManager = this.getRootFocusManager();
    // Si nous sommes dans un arbre de focusManager, il faut désactiver les autres focusManager des vues courantes avant de positionner le nouvel élément courant
    rootFocusManager.disableNavigationForAll();
    // Positionner comme courant à chaque noeud de l'arbre
    this.setCurrentBranch(event.currentTarget);

    this.enableKeyNavigation();
    // Si on clique dans une zone accessible par la touche entrée, on doit pouvoir la quitter avec la touche Escape
    this.setCanExit(this.#enterToAccess);

    event.stopPropagation();
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
   * Donne le contrôle au focusManager de la vue courante
   * @returns {FocusManager} focusManager de la vue
   */
  giveControlToCurrent() {
    const focusManager = this.getChildFocusManager();
    this.giveControlToFocusManager(focusManager);
    focusManager.giveFocus();
    return focusManager;
  }

  /**
   * Donne le contrôle au focusManager parent
   * @returns {FocusManager} focusManager parent
   */
  giveControlToParent() {
    const parentFocusManager = this.getParentFocusManager();
    this.giveControlToFocusManager(parentFocusManager);
    return parentFocusManager;
  }

  /**
   * Donne le contrôle au focusManager précisé en entrée
   * @param {FocusManager} focusManager
   */
  giveControlToFocusManager(focusManager) {
    this.disableKeyNavigation();
    focusManager.enableKeyNavigation();
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

}
export default FocusManager;
