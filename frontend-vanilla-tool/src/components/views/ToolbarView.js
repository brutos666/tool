import CompositeView from './CompositeView.js';
import FocusManager from './FocusManager.js';

class ToolbarView extends CompositeView {

  name = 'ToolbarView';

  /** @type {FocusManager} */
  #focusManager = null;

  constructor() {
    super();
    this.#focusManager = new FocusManager(this.getElementView(), 'horizontal', false);
  }
  /**
   * @override {@link View.getHtmlView}
   */
  getHtmlView() {
    return String.raw`<div id="spaceChildren" class="toolbar toolbar__space" role="toolbar"></div>`;
  }

  addView(view) {
    super.addView(view);

    // Un bouton est parfois ajouté après l'ajout de la bar d'outils au parent. On doit donc relancer l'écoute des touches de navigation au clavier en prenant en compte le nouveau bouton
    if (this.#focusManager.areKeysListened()) {
      this.#focusManager.restartListenKeys();
    }
  }

  added(parent) {
    super.added(parent);

    this.#focusManager.listenKeys();
  }

  destroy() {
    this.#focusManager.stopListenKeys();
  }

}

export default ToolbarView;