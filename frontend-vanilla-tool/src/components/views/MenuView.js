import CompositeView from './CompositeView.js';
/** @import DecoratorView from '../decorators/views/DecoratorView.js'; */

class MenuView extends CompositeView {

  name = 'MenuView';

  #menuChangeCallback = () => {};
  #menuShowHideCallback = () => {};

  /** @type {HTMLMenuElement} */
  #menu_actions = null;
  #horizontal = false;

  #font_size = null;
  #resizeObserver = null;

  constructor() {
    super();

    this.#menu_actions = this.getElementView()
      .querySelector('.menu__actions');

    this.#menu_actions.addEventListener('toggle', event => {
      this.#menuShowHideCallback(event.newState);
    });

    this.#resizeObserver = new ResizeObserver(this.sizeHasChanged.bind(this));
    this.#resizeObserver.observe(this.getElementView(), { box: 'content-box' });
  }

  getHtmlView() {
    return String.raw`<nav class="menu" aria-label="Menu des commandes" >
      <template id='burgerButton' class="menu__button menu__element" aria-controls="spaceChildren" popovertarget='spaceChildren'></template>
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

  setOnMenuChangeCallback(menuChangeCallback) {
    this.#menuChangeCallback = menuChangeCallback;
  }
  setOnMenuShowHideCallback(menuShowHideCallback) {
    this.#menuShowHideCallback = menuShowHideCallback;
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
    this.#menuChangeCallback('vertical');
    this.#horizontal = false;
    this.#menu_actions.classList.add('menu__actions-vertical');
    this.#menu_actions.popover = 'auto';
  }

  changeToHorizontalMenu() {
    if (this.#horizontal) {
      return;
    }
    this.#menuChangeCallback('horizontal');
    this.#horizontal = true;

    this.#menu_actions.classList.remove('menu__actions-vertical');
    this.#menu_actions.popover = null;
  }

  destroy() {
    super.destroy();
    this.#resizeObserver.disconnect();
  }

}

export default MenuView;