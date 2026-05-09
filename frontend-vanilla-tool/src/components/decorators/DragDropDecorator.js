import DragButton from '../DragButton.js';
import ItemDecorator from './ItemDecorator.js';
import DragDropDecoratorView from './views/DragDropDecoratorView.js';

class DragDropDecorator extends ItemDecorator {

  name = 'DragDropItemDecorator';

  constructor(decoratedElement) {
    super(new DragDropDecoratorView(decoratedElement.getView()), decoratedElement);

    const dragAction = new DragButton();
    this.setStaticChild('dragAction', dragAction);
  }

}

export default DragDropDecorator;