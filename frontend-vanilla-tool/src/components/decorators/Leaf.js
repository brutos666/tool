import Decorator from './Decorator.js';
import LeafView from './views/LeafView.js';

class Leaf extends Decorator {

  name = 'Leaf';
  constructor(element) {
    super(new LeafView(element.getView()), element);
  }

}

export default Leaf;