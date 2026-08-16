import ItemsView from './ItemsView.js';

class NavTreeView extends ItemsView {

  name = 'NavTreeView';

  constructor() {
    super();
    this.getElementView()
      .classList.add('nav-tree__content');
  }

  getHtmlView() {
    return String.raw`<nav><ol class="nav-tree__items items__space" aria-orientation="vertical"></ol><footer class="nav-tree__footer" ><template id="addItemAction" tabindex="0"></template></footer></nav>`;
  }

}

export default NavTreeView;