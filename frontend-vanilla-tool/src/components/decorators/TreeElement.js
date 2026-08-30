import Decorator from './Decorator.js';
import TreeElementView from './views/TreeElementView.js';

class TreeElement extends Decorator {

  name = 'TreeElement';

  constructor(decoratedElement) {
    super(new TreeElementView(decoratedElement.getView()), decoratedElement);
  }

}

export default TreeElement;