import ItemsView from './ItemsView.js';

class TreeListView extends ItemsView {

  name = 'TreeListView';

  constructor(data) {
    super(data);
    this.getElementView()
      .classList.add('tree-list__space');
  }

}

export default TreeListView;