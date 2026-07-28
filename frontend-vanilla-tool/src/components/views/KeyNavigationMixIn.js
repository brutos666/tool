import DOMUtilities from '../../tools/DOMUtilities.js';
const KeyNavigationMixin = superclass => class extends superclass {

  #keyEvent = {
    Tab: this.onKeyTab.bind(this),
    // Les flèches sont nécessaires pour naviguer entre les différentes options du menu
    ArrowUp: this.onKeyArrowUp.bind(this),
    ArrowDown: this.onKeyArrowDown.bind(this),
    ArrowLeft: this.onKeyArrowLeft.bind(this),
    ArrowRight: this.onKeyArrowRight.bind(this),
    Home: this.onKeyHome.bind(this),
    End: this.onKeyEnd.bind(this)
  };
  /** @type {HTMLElement} */
  #current = null;
  /** @type {Array<HTMLButtonElement>} */
  #button_elements = [];
  /** @type {'horizontal'|'vertical'|'none'} */
  #orientation = 'horizontal';
  #tabulation = false;

  /**
   * Met en place la navigation
   * @param {HTMLElement} parent : conteneur des éléments
   * @param {Array<HTMLButtonElement} elements : Boutons ou éléments de navigation
   * @param {'horizontal'|'vertical'|'none'} orientation : déplacement horizontal ou vertical ou non positionné
   * @param {boolean} tabulation : traite la tabulation en plus des flèches et garde la navigation à l'intérieur du conteneur
   */
  setNavigation(parent, elements, orientation = 'none', tabulation = false) {
    this.#button_elements = elements;
    this.#orientation = orientation;
    this.#tabulation = tabulation;
    for (const button of this.#button_elements) {
      button.setAttribute('tabindex', '-1');
    }
    this.#current = this.#button_elements[0];
    this.#current.setAttribute('tabindex', 0);

    parent.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  navigationChangeOrientation(orientation) {
    this.#orientation = orientation;
  }
  navigationChangeTabulation(tabulation) {
    this.#tabulation = tabulation;
  }

  navigationGiveFocus() {
    this.#current.focus();
  }

  navigationIsFocused() {
    return document.activeElement === this.#current;
  }

  isNavigationHorizontal() {
    return this.#orientation === 'horizontal';
  }
  isNavigationVertical() {
    return this.#orientation === 'vertical';
  }
  isNavigationActive() {
    return this.#orientation !== 'none';
  }

  setCurrent(button) {
    this.#current.setAttribute('tabindex', '-1');

    this.#current = button;
    this.#current.setAttribute('tabindex', 0);
    this.#current.focus();
  }

  interceptKeys() {
    if (DOMUtilities.isHidden(this.#current)) {
      return [];
    }
    const keys = [ 'Home', 'End' ];
    if (this.#tabulation) {
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
    if (!this.interceptKeys()
      .includes(event.key)) {
      return;
    }
    event.preventDefault();
    this.#keyEvent[event.key]?.(event);
  }
  onKeyHome() {
    this.focusToFirst();
  }
  onKeyEnd() {
    this.focusToLast();
  }
  onKeyArrowDown() {
    this.focusToDirection('Down');
  }
  onKeyArrowUp() {
    this.focusToDirection('Up');
  }
  onKeyArrowRight() {
    this.focusToDirection('Right');
  }
  onKeyArrowLeft() {
    this.focusToDirection('Left');
  }
  onKeyTab(event) {
    this.focusToDirection(event.shiftKey ? 'Up' : 'Down');
  }

  focusToFirst() {
    this.setCurrent(this.#button_elements[0]);
  }
  focusToLast() {
    this.setCurrent(this.#button_elements[this.#button_elements.length - 1]);
  }

  focusToDirection(direction) {
    let indexFocus = this.#button_elements.indexOf(this.#current);
    if (direction === 'Up') {
      indexFocus--;
    } else if (direction === 'Down') {
      indexFocus++;
    } else if (direction === 'Left') {
      indexFocus--;
    } else if (direction === 'Right') {
      indexFocus++;
    }
    if (indexFocus === this.#button_elements.length) {
      indexFocus = 0;
    } else if (indexFocus === -1) {
      indexFocus = this.#button_elements.length - 1;
    }
    this.setCurrent(this.#button_elements[indexFocus]);
  }

};
export default KeyNavigationMixin;