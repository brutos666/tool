import DOMUtilities from '../../tools/DOMUtilities.js';
/** @import TreeView from '../decorators/views/TreeView.js'; */
/** @import View from './View.js'; */

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

  #onBlurEvent = this.onBlur.bind(this);

  /** @type {HTMLElement} */
  #current = null;
  /** @type {HTMLElement} */
  #container = null;
  /** @type {Array<HTMLElement>} */
  #focusableElements = [];
  /** @type {Array<View>} */
  #focusableViews = [];
  #listened = false;

  /** @type {'horizontal'|'vertical'} */
  #orientation = 'horizontal';
  #canTab = false;
  #canEnter = false;

  #isEnter = false;

  /**
   * @constructor
   * @param {HTMLElement} container : conteneur des éléments
   * @param {'horizontal'|'vertical'|'tree'} orientation : déplacement horizontal ou vertical ou arbre
   * @param {boolean} canTab : traite la tabulation en plus des flèches et garde la navigation à l'intérieur du conteneur
   * @param {boolean} canEnter : traite la possibilité d'entrer dans un élément pour naviguer à l'intérieur
   */
  constructor(container, orientation, canTab, canEnter) {
    this.#container = container;
    this.#orientation = orientation;
    this.#canTab = canTab;
    this.#canEnter = canEnter;
  }

  /**
   * Positionne le parent si besoin
   * @param {View} parent : parent
   */
  setParent(/* parent*/) {}

  isCanEnter() {
    return this.#canEnter;
  }
  isEnter() {
    return this.#isEnter;
  }
  getContainer() {
    return this.#container;
  }

  /**
   * Ajout d'un élément focusable
   * @param {View} view
   * @param {string|undefined} selector : sélecteur facultatif pour spécifier un sous-élément
   */
  addFocusableView(view, selector) {
    this.#focusableViews.push(view);

    const element = view.getElementView();
    const focusableElement = selector ? element.querySelector(selector) : element;
    focusableElement.setAttribute('tabindex', -1);
    this.#focusableElements.push(focusableElement);
    if (this.#focusableElements.length === 1) {
      this.setCurrent(this.#focusableElements[0]);
    }
  }
  removeFocusableView(index) {
    this.#focusableViews.splice(index, 1);

    const element = this.#focusableElements[index];
    element.removeAttribute('tabindex');
    this.#focusableElements.splice(index, 1);
    if (this.#current === element) {
      if (this.#focusableElements.length === 0) {
        this.removeCurrent();
      } else {
        this.setCurrent(this.#focusableElements[0]);
      }
    }
  }
  removeAllFocusableViews() {
    this.#focusableViews = [];
    this.#focusableElements = [];
    this.removeCurrent();
  }
  getCurrentView() {
    return this.#focusableViews[this.getIndexCurrent()];
  }
  getFocusableViews() {
    return this.#focusableViews;
  }
  getFocusableViewAt(index) {
    return this.#focusableViews[index];
  }

  /**
   * Liste les éléments pouvant prendre le focus.
   * Positionne l'élément devant prendre le focus au clavier parmi tous les éléments
   * Écoute l'appui sur les touches du clavier (si plus d'un élément)
   */
  listenKeys() {
    this.#listened = true;
    this.#current?.setAttribute('tabindex', 0);
    this.#current?.addEventListener('blur', this.#onBlurEvent, true);

    this.#container.addEventListener('keydown', this.#onKeyDownEvent);
  }
  stopListenKeys() {
    this.#listened = false;
    this.#current?.setAttribute('tabindex', -1);
    this.#current?.removeEventListener('blur', this.#onBlurEvent, true);

    this.#container.removeEventListener('keydown', this.#onKeyDownEvent);
  }
  isListened() {
    return this.#listened;
  }

  onBlur() {
    this.#isEnter = false;
  }

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

  giveFocus() {
    this.#current.focus();
  }
  isCurrentFocused() {
    return document.activeElement === this.#current;
  }

  setCurrent(button) {
    this.removeCurrent();
    this.#current = button;
    // Ne permettre la prise de focus que si le focusManager est à l'écoute
    this.#current.setAttribute('tabindex', this.isListened() ? 0 : -1);
    if (this.isListened()) {
      this.#current.addEventListener('blur', this.#onBlurEvent, true);
    }
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
    this.#current.setAttribute('tabindex', -1);
    this.#current.removeEventListener('blur', this.#onBlurEvent, true);
    this.#current = null;
  }

  interceptKeys() {
    if (DOMUtilities.isHidden(this.#current)) {
      return [];
    }
    if (this.isEnter()) {
      return ['Escape'];
    }

    const keys = [ 'Home', 'End' ];
    if (this.#canTab) {
      keys.push('Tab');
    }
    if (this.isCanEnter()) {
      keys.push('Enter');
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

  #onKeyEnter() {
    this.#current.setAttribute('tabindex', -1);
    this.#isEnter = true;
  }
  #onKeyEscape() {
    this.#current.setAttribute('tabindex', 0);
    this.#isEnter = false;
  }

  #focusToFirst() {
    this.setCurrent(this.#focusableElements[0]);
    this.#current.focus();
  }
  #focusToLast() {
    this.setCurrent(this.#focusableElements[this.#focusableElements.length - 1]);
    this.#current.focus();
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
      this.#current.focus();
    }
  }

}
export default FocusManager;
