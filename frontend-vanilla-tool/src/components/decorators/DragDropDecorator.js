import ItemDecorator from './ItemDecorator.js';
import DragDropDecoratorView from './views/DragDropDecoratorView.js';

class DragDropDecorator extends ItemDecorator {

  name = 'DragDropItemDecorator';

  constructor(decoratedElement) {
    super(new DragDropDecoratorView(decoratedElement.getView()), decoratedElement);
  }

}

export default DragDropDecorator;