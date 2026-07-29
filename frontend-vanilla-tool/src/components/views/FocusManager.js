import DOMUtilities from '../../tools/DOMUtilities.js';

class FocusManager {

  #keyEvent = {
    Tab: this.#onKeyTab.bind(this),
    // Les flèches sont nécessaires pour naviguer entre les différentes éléments
    ArrowUp: this.#focusToDirection.bind(this, 'Up'),
    ArrowDown: this.#focusToDirection.bind(this, 'Down'),
    ArrowLeft: this.#focusToDirection.bind(this, 'Left'),
    ArrowRight: this.#focusToDirection.bind(this, 'Right'),
    Home: this.#focusToFirst.bind(this),
    End: this.#focusToLast.bind(this)
  };
  #onKeyDownEvent = this.#onKeyDown.bind(this);

  /** @type {HTMLElement} */
  #current = null;
  /** @type {HTMLElement} */
  #parent = null;
  /** @type {Array<HTMLButtonElement>} */
  #focusable_elements = [];
  /** @type {'horizontal'|'vertical'} */
  #orientation = 'horizontal';
  #tabulation = false;
  #navigationStart = false;

  /**
   * @constructor
   * @param {HTMLElement} parent : conteneur des éléments
   * @param {'horizontal'|'vertical'} orientation : déplacement horizontal ou vertical ou non positionné
   * @param {boolean} tabulation : traite la tabulation en plus des flèches et garde la navigation à l'intérieur du conteneur
   */
  constructor(parent, orientation, tabulation) {
    this.#orientation = orientation;
    this.#tabulation = tabulation;
    this.#parent = parent;
  }

  /**
   * Liste les éléments pouvant prendre le focus.
   * Positionne l'élément devant prendre le focus au clavier parmi tous les éléments
   * Écoute l'appui sur les touches du clavier (si plus d'un élément)
   */
  listenKeys() {
    this.#navigationStart = true;
    this.#focusable_elements = [];
    this.#parent.querySelectorAll('button, select, input')
      .forEach(focusableElement => {
        focusableElement.setAttribute('tabindex', '-1');
        this.#focusable_elements.push(focusableElement);
      });

    const nbFocusable = this.#focusable_elements.length;
    switch (nbFocusable) {
      case 0:
        this.#current = null;
        break;
      case 1:
        this.#current = this.#focusable_elements[0];
        this.#current.setAttribute('tabindex', 0);
        break;
      default:
        this.#parent.addEventListener('keydown', this.#onKeyDownEvent);
        if (!(this.#current && this.#focusable_elements.includes(this.#current))) {
          this.#current = this.#focusable_elements[0];
        }
        this.#current.setAttribute('tabindex', 0);
        break;
    }
  }
  restartListenKeys() {
    this.stopListenKeys();
    this.listenKeys();
  }
  stopListenKeys() {
    this.#navigationStart = false;
    this.#parent.removeEventListener('keydown', this.#onKeyDownEvent);
  }
  areKeysListened() {
    return this.#navigationStart;
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
    this.#tabulation = tabulation;
  }

  giveFocus() {
    this.#current.focus();
  }
  isCurrentFocused() {
    return document.activeElement === this.#current;
  }

  #setCurrent(button) {
    this.#current.setAttribute('tabindex', '-1');

    this.#current = button;
    this.#current.setAttribute('tabindex', 0);
    this.#current.focus();
  }

  #interceptKeys() {
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
  #onKeyDown(event) {
    if (!this.#interceptKeys()
      .includes(event.key)) {
      return;
    }
    event.preventDefault();
    this.#keyEvent[event.key]?.(event);
  }

  #onKeyTab(event) {
    this.#focusToDirection(event.shiftKey ? 'Up' : 'Down');
  }

  #focusToFirst() {
    this.#setCurrent(this.#focusable_elements[0]);
  }
  #focusToLast() {
    this.#setCurrent(this.#focusable_elements[this.#focusable_elements.length - 1]);
  }

  #focusToDirection(direction) {
    let indexFocus = this.#focusable_elements.indexOf(this.#current);
    if ([ 'Up', 'Left' ].includes(direction)) {
      indexFocus--;
    } else if ([ 'Down', 'Right' ].includes(direction)) {
      indexFocus++;
    }
    if (indexFocus === this.#focusable_elements.length) {
      indexFocus = 0;
    } else if (indexFocus === -1) {
      indexFocus = this.#focusable_elements.length - 1;
    }
    this.#setCurrent(this.#focusable_elements[indexFocus]);
    if (DOMUtilities.isHidden(this.#current)) {
      this.#focusToDirection(direction);
    }
  }

}
export default FocusManager;
