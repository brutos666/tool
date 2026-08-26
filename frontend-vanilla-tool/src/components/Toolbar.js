import Composite from './Composite.js';
import FocusManager from './FocusManager.js';
import ToolbarView from './views/ToolbarView.js';

class Toolbar extends Composite {

  constructor() {
    super(new ToolbarView());
    // NOTE : le système de focus est positionné mais l'écoute des touches de navigation ne doit pas être effective au départ. C'est le composant qui contient la barre d'outils qui doit piloter au départ
    super.setFocusManager(new FocusManager(this.getElementView(), 'horizontal', false));
  }
  /**
   * @override
   * @returns {ToolbarView}
   */
  getView() {
    return super.getView();
  }

  /** @override */
  addChild(element) {
    super.addChild(element);

    super.getFocusManager()
      .addComponent(element);
  }

}

export default Toolbar;