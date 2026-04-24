import CompositeView from './CompositeView.js';

class MenuView extends CompositeView {

  name = 'MenuView';

  getHtmlView() {
    return String.raw`<nav class="menu">
      <input id="menuButton" type="checkbox" aria-expanded="false" aria-controls="spaceChildren" aria-label="Ouvrir le menu" hidden/>
      <label for="menuButton" class="menu__button mobile-only">☰</label>
      <menu class="menu__actions" id="spaceChildren" role="menu"></menu>
  </nav>`;
  }

}

export default MenuView;