import MenuElementView from './views/MenuElementView.js';
import Decorator from './Decorator.js';

class MenuElement extends Decorator {

  name = 'MenuElement';

  constructor(decoratedElement) {
    super(new MenuElementView(decoratedElement.getView()), decoratedElement);
  }

}

export default MenuElement;