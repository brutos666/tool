import CompositeView from './CompositeView.js';

class MenuView extends CompositeView {

  name = 'MenuView';

  getHtmlView() {
    return String.raw`<menu class="menu" id="spaceChildren"></menu>`;
  }

}

export default MenuView;