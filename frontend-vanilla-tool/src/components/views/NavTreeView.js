import ItemsView from './ItemsView.js';

class NavTreeView extends ItemsView {

  name = 'NavTreeView';

  constructor() {
    super({ addButton: true });
    this.getElementView()
      .classList.add('nav-tree__content');
  }

}

export default NavTreeView;