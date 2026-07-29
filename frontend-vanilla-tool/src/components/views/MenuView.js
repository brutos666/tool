import CompositeView from './CompositeView.js';
import FocusManager from './FocusManager.js';
/** @import DecoratorView from '../decorators/views/DecoratorView.js'; */

class MenuView extends CompositeView {

  name = 'MenuView';

  /** @type {HTMLLabelElement} */
  #menu_button = null;
  /** @type {HTMLMenuElement} */
  #menu_actions = null;
  #horizontal = false;

  #font_size = null;
  #resizeObserver = null;

  /** @type {FocusManager} */
  #focusManager = null;

  constructor() {
    super();

    this.#menu_button = this.getElementView()
      .querySelector('.menu__button');
    this.#menu_actions = this.getElementView()
      .querySelector('.menu__actions');

    this.#focusManager = new FocusManager(this.#menu_actions, 'horizontal', false);

    this.#menu_actions.addEventListener('toggle', event => {
      if (event.newState === 'open') {
        this.#menu_button.setAttribute('tabindex', '-1');
        this.#focusManager.giveFocus();
        return;
      }
      this.#menu_button.setAttribute('tabindex', '0');
      this.#menu_button.focus();
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

    // Lorsqu'un bouton de menu sera cliquer lorsque le menu burger sera ouvert, ce dernier se fermera
    button.popoverTargetElement = this.#menu_actions;
    button.popoverTargetAction = 'hide';
  }

  added(parent) {
    super.added(parent);
    this.#focusManager.listenKeys();
  }

  sizeHasChanged(entries) {
    for (const entry of entries) {
      if (!entry.contentBoxSize) {
        continue;
      }
      const boxSize = entry.contentBoxSize[0] || entry.contentBoxSize;
      if (!this.#font_size) {
        this.#font_size = parseFloat(getComputedStyle(this.#menu_actions).fontSize);
      }
      if (boxSize.inlineSize / this.#font_size > 50) {
        this.changeToHorizontalMenu();
      } else {
        this.changeToBurgerMenu();
      }
    }
  }

  changeToBurgerMenu() {
    if (!this.#horizontal) {
      return;
    }
    this.#horizontal = false;
    this.#focusManager.changeOrientation('vertical');
    this.#focusManager.listenTabKey(true);
    this.#menu_button.classList.remove('hidden');
    this.#menu_button.setAttribute('tabindex', 0);
    this.#menu_actions.classList.add('menu__actions-vertical');
    this.#menu_button.popoverTargetElement = this.#menu_actions;
    this.#menu_button.popoverTargetAction = 'toggle';
    this.#menu_actions.popover = 'auto';
    if (this.#focusManager.isCurrentFocused()) {
      this.#menu_button.focus();
    }
  }

  changeToHorizontalMenu() {
    if (this.#horizontal) {
      return;
    }
    this.#horizontal = true;
    this.#focusManager.changeOrientation('horizontal');
    this.#focusManager.listenTabKey(false);
    this.#menu_button.classList.add('hidden');
    this.#menu_button.setAttribute('tabindex', -1);
    this.#menu_actions.classList.remove('menu__actions-vertical');
    this.#menu_button.popoverTargetElement = null;
    this.#menu_button.popoverTargetAction = null;
    this.#menu_actions.popover = null;
    if (document.activeElement === this.#menu_button) {
      this.#focusManager.giveFocus();
    }
  }

  destroy() {
    this.#resizeObserver.disconnect();
    this.#focusManager.stopListenKeys();
  }

}

export default MenuView;