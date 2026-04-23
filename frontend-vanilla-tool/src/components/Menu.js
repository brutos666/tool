import Composite from './Composite.js';
import MenuView from './views/MenuView.js';
import MenuElement from './decorators/MenuElement.js';

class Menu extends Composite {

  name = 'menu';
  constructor() {
    super(new MenuView());
  }

  /** @override */
  addChild(element) {
    // Ajout du décorateur de l'élément du menu
    const decorator = new MenuElement(element);
    return super.addChild(decorator);
  }

}

export default Menu;