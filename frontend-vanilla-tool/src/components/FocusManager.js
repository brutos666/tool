import DOMUtilities from '../tools/DOMUtilities.js';
/** @import Component from './Component.js'; */

class FocusManager {

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
    Home: this.#focusToFirst.bind(this),
    End: this.#focusToLast.bind(this)
  };
  #onKeyDownEvent = this.#onKeyDown.bind(this);
  #onMouseDownEvent = this.#onMouseDown.bind(this);

  /** @type {FocusManager} */
  #parentFocusManager = null;
  /** @type {HTMLElement} */
  #current = null;
  /** @type {Component} */
  #currentComponent = null;
  /** @type {HTMLElement} */
  #container = null;
  /** @type {Component} */
  #parent = null;
  /** @type {Array<HTMLElement>} */
  #focusableElements = [];
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
    return this.getCurrentComponent()
      ?.getFocusManager()
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

  enter() {
    const focusManager = this.giveControlToCurrent();
    focusManager.setParentFocusManager(this);
    focusManager.setCanExit(true);
  }

  exit() {
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

    const element = component.getElementView();
    const focusableElement = element;
    focusableElement.addEventListener('mousedown', this.#onMouseDownEvent);

    this.#focusableElements.push(focusableElement);
    if (this.#focusableElements.length === 1) {
      this.setCurrent(this.#focusableElements[0]);
    }
  }
  removeFocusable(index) {
    const element = this.#focusableElements[index];
    element.removeAttribute('tabindex');
    element.removeEventListener('mousedown', this.#onMouseDownEvent);
    if (this.#current === element) {
      if (this.#focusableElements.length === 1) {
        this.removeCurrent();
      } else {
        this.setCurrent(this.#focusableElements[0]);
      }
    }
    this.#focusable.splice(index, 1);
    this.#focusableElements.splice(index, 1);
  }
  removeAllFocusable() {
    this.removeCurrent();
    for (const element of this.#focusableElements) {
      element.removeEventListener('mousedown', this.#onMouseDownEvent);
    }
    this.#focusable = [];
    this.#focusableElements = [];
  }
  getCurrentComponent() {
    return this.#focusable[this.getIndexCurrent()];
  }
  getFocusable() {
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
   * Liste les éléments pouvant prendre le focus.
   * Positionne l'élément devant prendre le focus au clavier parmi tous les éléments
   * Écoute l'appui sur les touches du clavier (si plus d'un élément)
   */
  listenKeys() {
    this.#listened = true;
    // this.#current?.setAttribute('tabindex', 0);
    this.getCurrentComponent()
      ?.setTabIndex(0);
    setTimeout(() => {
      // Astuce pour que l'écoute ne soit pas prise en compte lorsque l'appui sur une touche est en cours
      this.#container.addEventListener('keydown', this.#onKeyDownEvent);
    }, 0);
  }
  stopListenKeys() {
    this.#listened = false;
    // this.#current?.setAttribute('tabindex', -1);
    this.getCurrentComponent()
      ?.setTabIndex(-1);
    this.#container.removeEventListener('keydown', this.#onKeyDownEvent);
  }
  stopAllListenKeys() {
    this.stopListenKeys();
    const childFocusManager = this.getCurrentComponent()
      ?.getFocusManager();
    childFocusManager?.stopAllListenKeys();
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
    this.getCurrentComponent()
      .giveFocus();
    // this.#current?.focus();
  }
  isCurrentFocused() {
    return document.activeElement === this.#current;
  }

  setCurrent(button) {
    this.removeCurrent();
    this.#current = button;
    /*
     * Ne permettre la prise de focus que si le focusManager est à l'écoute
     * this.#current.setAttribute('tabindex', this.isListened() ? 0 : -1);
     */
    this.getCurrentComponent()
      .setTabIndex(this.isListened() ? 0 : -1);
  }
  setCurrentWithIndex(index) {
    this.setCurrent(this.#focusableElements[index]);
  }
  getCurrent() {
    return this.#current;
  }
  getIndexCurrent() {
    return this.#focusableElements.indexOf(this.#current);
  }
  removeCurrent() {
    if (!this.#current) {
      return;
    }
    // this.#current.setAttribute('tabindex', -1);
    this.getCurrentComponent()
      .setTabIndex(-1);
    this.#current = null;
  }
  setCurrentBranch(target) {
    for (const element of this.#focusableElements) {
      if (element === target || element.contains(target)) {
        this.setCurrent(element);
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
    if (DOMUtilities.isHidden(this.#current)) {
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

  #onKeyTab(event) {
    this.focusToDirection(event.shiftKey ? 'Up' : 'Down');
  }

  #focusToFirst() {
    this.setCurrent(this.#focusableElements[0]);
    this.giveFocus();
  }
  #focusToLast() {
    this.setCurrent(this.#focusableElements[this.#focusableElements.length - 1]);
    this.giveFocus();
  }

  focusToDirection(direction) {
    let indexCurrent = this.#focusableElements.indexOf(this.#current);
    if ([ 'Up', 'Left' ].includes(direction)) {
      indexCurrent--;
    } else if ([ 'Down', 'Right' ].includes(direction)) {
      indexCurrent++;
    }
    if (indexCurrent === this.#focusableElements.length) {
      indexCurrent = 0;
    } else if (indexCurrent === -1) {
      indexCurrent = this.#focusableElements.length - 1;
    }
    this.setCurrent(this.#focusableElements[indexCurrent]);
    if (DOMUtilities.isHidden(this.#current)) {
      this.focusToDirection(direction);
    } else {
      this.giveFocus();
    }
  }

  /** Entrée et sortie dans un autre système de navigation **/
  #onKeyEnter() {
    this.enter();
  }
  #onKeyEscape() {
    this.exit();
  }

  /*
   * Prise de focus par la souris
   * ---------------------------------------------------
   */
  #onMouseDown(event) {
    const rootFocusManager = this.getRootFocusManager();
    // Si nous sommes dans un arbre de focusManager, il faut désactiver les autres focusManager des vues courantes avant de positionner le nouvel élément courant
    rootFocusManager.stopAllListenKeys();
    // Positionner comme courant à chaque noeud de l'arbre
    this.setCurrentBranch(event.currentTarget);

    this.listenKeys();
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

  /**
   * Donne le contrôle au focusManager de la vue courante
   * @returns {FocusManager} focusManager de la vue
   */
  giveControlToCurrent() {
    const focusManager = this.getCurrentComponent()
      .getFocusManager();
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
    this.stopListenKeys();
    focusManager.listenKeys();
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
