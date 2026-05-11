import ItemDecorator from './ItemDecorator.js';
import ListItemDecoratorView from './views/ListItemDecoratorView.js';

class ListItemDecorator extends ItemDecorator {

  name = 'ListItemDecorator';

  constructor(decoratedElement) {
    super(new ListItemDecoratorView(decoratedElement.getView()), decoratedElement);
  }

}

export default ListItemDecorator;