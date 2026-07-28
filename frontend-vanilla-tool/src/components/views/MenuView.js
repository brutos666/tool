import DOMUtilities from '../../tools/DOMUtilities.js';
import CompositeView from './CompositeView.js';
/** @import DecoratorView from '../decorators/views/DecoratorView.js'; */

class MenuView extends CompositeView {

  name = 'MenuView';

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

  /** @type {Array<HTMLButtonElement>} */
  #menu_elements = [];
  /** @type {HTMLLabelElement} */
  #menu_button = null;
  /** @type {HTMLMenuElement} */
  #menu_actions = null;

  #font_size = null;
  #verticalMode = false;
  /** @type {MenuElementView} */
  #current = null;
  #resizeObserver = null;

  constructor() {
    super();

    this.getElementView()
      .addEventListener('keydown', this.onKeyDown.bind(this));
    this.#menu_button = this.getElementView()
      .querySelector('.menu__button');
    this.#menu_actions = this.getElementView()
      .querySelector('.menu__actions');
    this.#menu_actions.addEventListener('toggle', event => {
      if (event.newState === 'open') {
        this.#menu_button.setAttribute('tabindex', '-1');
        this.#current.focus();
      } else {
        this.#menu_button.setAttribute('tabindex', '0');
        this.#menu_button.focus();
      }
    });

    this.#resizeObserver = new ResizeObserver(this.sizeHasChanged.bind(this));
    this.#resizeObserver.observe(this.getElementView(), { box: 'content-box' });
  }

  getHtmlView() {
    return String.raw`<nav class="menu" aria-label="Menu des commandes" >
      <button class="menu__button menu__element" aria-label="Ouvrir le menu" aria-controls="spaceChildren" aria-haspopup="true" type="button" tabindex="0" >☰</button>
      <menu class="menu__actions" id="spaceChildren" role="menu" aria-label="Commandes"></menu>
  </nav>`;
  }

  /**
   * @override
   * @param {DecoratorView} view : vue
   */
  addView(view) {
    super.addView(view);
    const button = view.getElementView()
      .querySelector('button');

    this.#menu_elements.push(button);
    button.setAttribute('tabindex', '-1');
    // Lorsqu'un bouton de menu sera cliquer lorsque le menu burger sera ouvert, ce dernier se fermera
    button.popoverTargetElement = this.#menu_actions;
    button.popoverTargetAction = 'hide';
  }

  addedToPage() {
    this.#menu_button.setAttribute('tabindex', 0);
    this.#menu_elements[0].setAttribute('tabindex', 0);

    this.#current = this.#menu_elements[0];
    this.#font_size = parseFloat(getComputedStyle(this.#menu_actions).fontSize);
  }

  setCurrent(button) {
    this.#current.setAttribute('tabindex', '-1');

    this.#current = button;
    this.#current.setAttribute('tabindex', 0);
    this.#current.focus();
  }

  sizeHasChanged(entries) {
    for (const entry of entries) {
      if (!entry.contentBoxSize) {
        continue;
      }
      const boxSize = entry.contentBoxSize[0] || entry.contentBoxSize;
      if (boxSize.inlineSize / this.#font_size > 50) {
        this.#menu_button.classList.add('hidden');
        this.#menu_actions.classList.remove('menu__actions-vertical');
        this.#menu_button.popoverTargetElement = null;
        this.#menu_button.popoverTargetAction = null;
        this.#menu_actions.popover = null;
        this.#verticalMode = false;
        if (document.activeElement === this.#menu_button) {
          this.#current.focus();
        }
      } else {
        this.#menu_button.classList.remove('hidden');
        this.#menu_actions.classList.add('menu__actions-vertical');
        this.#menu_button.popoverTargetElement = this.#menu_actions;
        this.#menu_button.popoverTargetAction = 'toggle';
        this.#menu_actions.popover = 'auto';
        this.#verticalMode = true;
        if (document.activeElement === this.#current) {
          this.#menu_button.focus();
        }
      }
    }
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

  interceptKeys() {
    if (this.#verticalMode) {
      if (DOMUtilities.isHidden(this.#menu_actions)) {
        return [];
      }
      return [ 'Tab', 'ArrowDown', 'ArrowUp', 'Home', 'End' ];
    }
    return [ 'ArrowRight', 'ArrowLeft', 'Home', 'End' ];
  }

  focusToFirst() {
    this.setCurrent(this.#menu_elements[0]);
  }
  focusToLast() {
    this.setCurrent(this.#menu_elements[this.#menu_elements.length - 1]);
  }

  focusToDirection(direction) {
    let indexFocus = this.#menu_elements.indexOf(this.#current);

    if (direction === 'Up') {
      indexFocus--;
    } else if (direction === 'Down') {
      indexFocus++;
    } else if (direction === 'Left') {
      indexFocus--;
    } else if (direction === 'Right') {
      indexFocus++;
    }
    if (indexFocus === this.#menu_elements.length) {
      indexFocus = 0;
    } else if (indexFocus === -1) {
      indexFocus = this.#menu_elements.length - 1;
    }
    this.setCurrent(this.#menu_elements[indexFocus]);
  }

  destroy() {
    this.#resizeObserver.disconnect();
  }

}

export default MenuView;