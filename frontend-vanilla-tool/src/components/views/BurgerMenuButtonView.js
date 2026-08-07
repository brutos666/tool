import View from './View.js';

class BurgerMenuButtonView extends View {

  constructor() {
    super();
  }

  getHtmlView() {
    return String.raw`<button aria-label="Ouvrir le menu" aria-haspopup="true" type="button" tabindex="0" popovertargetaction='toggle' >☰</button>`;
  }

}
export default BurgerMenuButtonView;