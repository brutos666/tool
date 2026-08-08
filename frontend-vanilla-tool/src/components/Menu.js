import BurgerMenuButton from './BurgerMenuButton.js';
import Composite from './Composite.js';
import MenuElement from './decorators/MenuElement.js';
import FocusManager from './FocusManager.js';
import MenuView from './views/MenuView.js';

class Menu extends Composite {

  name = 'menu';

  /** @type {BurgerMenuButton} */
  #burgerButton = null;

  constructor() {
    super(new MenuView());
    super.setFocusManager(new FocusManager(this.getElementView(), 'horizontal', false, false));

    this.#burgerButton = new BurgerMenuButton();
    this.setStaticChild('burgerButton', this.#burgerButton);

    this.getView()
      .setOnMenuChangeCallback(this.onMenuChange.bind(this));
    this.getView()
      .setOnMenuShowHideCallback(this.onMenuShowHide.bind(this));
  }

  /** @override */
  addChild(element) {
    super.getFocusManager()
      .addComponent(element);

    // Ajout du décorateur de l'élément du menu
    const decorator = new MenuElement(element);
    return super.addChild(decorator);
  }

  onMenuChange(orientation) {
    super.getFocusManager()
      .changeOrientation(orientation);
    super.getFocusManager()
      .listenTabKey(orientation === 'vertical');

    if (orientation === 'vertical') {
      this.#burgerButton.setVisible();
      this.#burgerButton.setTabIndex(0);
      if (super.getFocusManager()
        .isCurrentFocused()) {
        this.#burgerButton.giveFocus();
      }
      super.getFocusManager()
        .disableKeyNavigation();
      return;
    }
    this.#burgerButton.setHidden();
    this.#burgerButton.setTabIndex(-1);
    if (this.#burgerButton.isFocused()) {
      super.getFocusManager()
        .giveFocus();
    }
    super.getFocusManager()
      .enableKeyNavigation();
  }

  onMenuShowHide(state) {
    if (state === 'open') {
      this.#burgerButton.setTabIndex(-1);
      super.getFocusManager()
        .giveFocus();
      super.getFocusManager()
        .enableKeyNavigation();
      return;
    }
    this.#burgerButton.setTabIndex(0);
    this.#burgerButton.giveFocus();
    super.getFocusManager()
      .disableKeyNavigation();
  }

}

export default Menu;