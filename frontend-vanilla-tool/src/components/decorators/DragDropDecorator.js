import DragButton from '../DragButton.js';
import ItemDecorator from './ItemDecorator.js';
import DragDropDecoratorView from './views/DragDropDecoratorView.js';

class DragDropDecorator extends ItemDecorator {

  name = 'DragDropDecorator';

  constructor(decoratedElement) {
    super(new DragDropDecoratorView(decoratedElement.getView()), decoratedElement);

    const dragAction = new DragButton(decoratedElement);
    this.setStaticChild('dragAction', dragAction);
  }

}

export default DragDropDecorator;