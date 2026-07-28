import DOMUtilities from '../../tools/DOMUtilities.js';
import CompositeView from './CompositeView.js';
/** @import DecoratorView from '../decorators/views/DecoratorView.js'; */

class MenuView extends CompositeView {

  name = 'MenuView';

  #keyEvent = {
    // Enter et Escape sont utiles pour le menu hamburger (affiché lorsque la largeur de l'application est petite)
    Enter: this.onKeyEnter.bind(this),
    Escape: this.onKeyEscape.bind(this),
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
  /** @type {HTMLInputElement} */
  #menu_show_button = null;

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
    this.#menu_show_button = this.getElementView()
      .querySelector('.menu__button-checkbox');
    this.#menu_show_button.addEventListener('change', this.onCheckMenuButton.bind(this));

    this.#resizeObserver = new ResizeObserver(this.sizeHasChanged.bind(this));
    this.#resizeObserver.observe(this.getElementView(), { box: 'content-box' });
  }

  getHtmlView() {
    // TODO : passer par une dialog pour le menu burger : ça mieux pour la navigation
    return String.raw`<nav class="menu" >
      <input id="menuButton" class="menu__button-checkbox" type="checkbox" aria-expanded="false" aria-controls="spaceChildren" aria-label="Ouvrir le menu" hidden/>
      <label for="menuButton" class="menu__button menu__element" tabindex="0">☰</label>
      <menu class="menu__actions" id="spaceChildren" role="menu"></menu>
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
  }

  addedToPage() {
    this.#menu_button.setAttribute('tabindex', 0);
    this.#menu_elements[0].setAttribute('tabindex', 0);

    this.#current = this.#menu_elements[0];
  }

  setCurrent(button) {
    this.#current.setAttribute('tabindex', '-1');

    this.#current = button;
    this.#current.setAttribute('tabindex', 0);
    this.#current.focus();
  }

  sizeHasChanged() {
    // Si le bouton qui affiche le menu verticalement est caché, il faut revenir à une navigation horizontale
    if (DOMUtilities.isHidden(this.#menu_button)) {
      if (document.activeElement === this.#menu_button) {
        this.#current.focus();
      }
      this.hideMenu();
    } else if (DOMUtilities.isHidden(document.activeElement) && DOMUtilities.isHidden(this.#current)) {
      this.#menu_button.focus();
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
  onKeyEnter() {
    this.showHideMenu(!this.#menu_show_button.checked);
    this.setCurrent(this.#menu_elements[0]);
  }
  onKeyEscape() {
    this.hideMenu();
    this.#menu_button.focus();
  }

  showHideMenu(show) {
    this.#menu_show_button.checked = show;
    this.onCheckMenuButton();
  }
  showMenu() {
    this.showHideMenu(true);
  }
  hideMenu() {
    this.showHideMenu(false);
  }

  interceptKeys() {
    if (document.activeElement === this.#menu_button) {
      return [ 'Enter', 'Escape' ];
    }
    if (this.#verticalMode) {
      return [ 'Escape', 'ArrowDown', 'ArrowUp', 'Home', 'End' ];
    }
    return [ 'ArrowRight', 'ArrowLeft', 'Home', 'End' ];
  }

  onCheckMenuButton() {
    this.#verticalMode = this.#menu_show_button.checked;
  }

  focusToFirst() {
    this.setCurrent(this.#menu_elements[0]);
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