import DOMUtilities from '../tools/DOMUtilities.js';
import TabFocusManager from './TabFocusManager.js';
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
  #components = [];
  /** @type {boolean} */
  #listened = false;

  /** @type {'horizontal'|'vertical'} */
  #orientation = 'horizontal';

  #canTab = false;
  #enterToAccess = false;
  #isInside = false;

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
      this.setOut();
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

  setIn() {
    this.#isInside = true;
    this.getContainer()
      .setAttribute('aria-description', 'Navigation active. Échap pour quitter.');
  }
  setOut() {
    this.#isInside = false;
    this.getContainer()
      .setAttribute('aria-description', 'Entrée pour activer la navigation.');
  }
  canExit() {
    return this.#isInside;
  }

  #enter() {
    if (!this.getChildFocusManager()) {
      return;
    }
    const focusManager = this.giveControlToCurrent();
    focusManager.setParentFocusManager(this);
    focusManager.setIn();
  }
  exit() {
    const parentFocusManager = this.giveControlToParent();
    parentFocusManager.giveFocus();
    this.setOut();
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
    this.#components.push(component);
    component.setTabIndex(-1);
    component.getView()
      .addEventListener('mousedown', this.#onMouseDownEvent);
    if (!this.getCurrent()) {
      this.setCurrentFirstFocusable();
    }
  }
  removeComponent(index) {
    const component = this.#components[index];
    component.setTabIndex(null);
    component.getView()
      .removeEventListener('mousedown', this.#onMouseDownEvent);
    this.#components.splice(index, 1);
    if (this.getCurrent() === component) {
      this.refreshCurrent(index);
    }
  }
  removeAllComponents() {
    this.removeCurrent();
    for (const component of this.#components) {
      component.getView()
        .removeEventListener('mousedown', this.#onMouseDownEvent);
    }
    this.#components = [];
  }
  getAllComponents() {
    return this.#components;
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
    this.#listened = true;
    this.getCurrent()
      ?.setTabIndex(0);
    setTimeout(() => {
      // Astuce pour que l'écoute ne soit pas prise en compte lorsque l'appui sur une touche est en cours
      this.#container.addEventListener('keydown', this.#onKeyDownEvent);
    }, 0);

    // Si on clique dans une zone accessible par la touche entrée, on doit pouvoir la quitter avec la touche Escape
    if (this.#enterToAccess) {
      this.setIn();
    }
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
    return current?.isFocused() || current.getElementView()
      .contains(document.activeElement);
  }
  giveFocusToFirst() {
    const firstFocusable = this.getFirstFocusable();
    if (firstFocusable) {
      this.setCurrent(firstFocusable);
      this.getCurrent()
        .giveFocus();
    }
  }
  giveFocusToLast() {
    const lastFocusable = this.getLastFocusable();
    if (lastFocusable) {
      this.setCurrent(lastFocusable);
      this.getCurrent()
        .giveFocus();
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
    // Si le composant contient un focusManager, alors ce dernier est accessible s'il existe un courant accessible
    const childFocusManager = component.getFocusManager();
    if (childFocusManager && !childFocusManager.getCurrent()) {
      return false;
    }
    return !component.isHidden() && !component.isDisabled() && !DOMUtilities.isHidden(component.getElementView()) && this.#components.includes(component);
  }
  hasFocusable() {
    // Le fait d'avoir un courant doit indiquer que
    return this.getCurrent();
  }

  /*
   * Positionnement du courant
   * ---------------------------------------------------
   */
  setCurrent(component) {
    this.removeCurrent();
    // Ne permettre la prise de focus que si le focusManager est à l'écoute
    component.setTabIndex(this.isListened() ? 0 : -1);
    this.#current = component;
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
    this.removeCurrent();
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
    this.removeCurrent();
    return false;
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
  removeCurrent() {
    if (!this.#current) {
      return;
    }
    this.getCurrent()
      .setTabIndex(-1);
    this.#current = null;
  }
  setCurrentBranch(target) {
    for (const component of this.#components) {
      const element = component.getElementView();
      if (element === target || element.contains(target)) {
        this.setCurrent(component);
        break;
      }
    }
    this.getParentFocusManager()
      ?.setCurrentBranch(target);
  }
  /**
   * Met à jour le courant lorsque un composant devient accessible ou inaccessible
   * @param currentIndexBeforeRemove - Index du courant avant sa suppression de la liste des composants. Lorsqu'il n'est pas fourni, c'est que le courant est toujours présent et sa position sera recherchée si besoin
   */
  refreshCurrent(currentIndexBeforeRemove) {
    if (DOMUtilities.isHidden(this.getContainer())) {
      return;
    }
    const currentWasFocused = this.isCurrentHasFocused();

    const focusManagerWithCurrent = this.updateCurrent(currentIndexBeforeRemove || this.getIndexCurrent());
    // Donner le contrôle au premier ancêtre avec un courant
    if (focusManagerWithCurrent) {
      this.giveControlToFocusManager(focusManagerWithCurrent);
      if (currentWasFocused) {
        focusManagerWithCurrent.giveFocus();
      }
    }
  }
  /**
   * Mise à jour du courant. Si pas de courant, on met à jour le courant du parent
   * @param currentIndex - position du courant dans la liste (avant suppression si ce dernier est supprimé des composants)
   * @returns le focusManager pour lequel le courant a pu être trouvé
   */
  updateCurrent(currentIndex) {
    const current = this.getCurrent();
    let found;
    if (current) {
      found = this.isFocusable(current) ? true : this.setCurrentNextFocusable(currentIndex);
    } else {
      found = this.setCurrentFirstFocusable();
    }
    const parentFocusManager = this.getParentFocusManager();
    if (!found) {
      if (!parentFocusManager) {
        return null;
      }
      return parentFocusManager.updateCurrent(parentFocusManager.getIndexCurrent());
    }
    return this;
  }

  /*
   * Navigation au clavier
   * ---------------------
   */
  interceptKeys() {
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
    this.#enter();
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

    const rootFocusManager = this.getRootFocusManager();
    // Si nous sommes dans un arbre de focusManager, il faut désactiver les autres focusManager des vues courantes avant de positionner le nouvel élément courant
    rootFocusManager.disableNavigationForAll();
    // Positionner comme courant à chaque noeud de l'arbre
    this.setCurrentBranch(event.currentTarget);

    if (this.getParentFocusManager() instanceof TabFocusManager) {
      // Des systèmes de navigation via des flèches peuvent être pilotés par un système de navigation plus global via tabulation. Ainsi, on naviguera d'un composant à l'autre via Tab et à l'intérieur du composant via les flèches. On donne ici la main au TabFocusManager. Il s'occupera d'activer le focusManager du composant courant.
      this.getParentFocusManager()
        .enableKeyNavigation();
    } else {
      this.enableKeyNavigation();
    }

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
    if (!parentFocusManager) {
      return null;
    }
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
