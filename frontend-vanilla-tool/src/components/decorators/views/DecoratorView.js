import View from '../../views/View.js';

class DecoratorView extends View {

  name = 'DecoratorView';

  #decoratedView;

  /**
   * @constructor
   * @param {View} view
   * @param {Object} data - Données à utiliser pour créer la vue
   */
  constructor(view, data) {
    super(data);
    this.setDecoratedView(view);
  }

  /**
   * Positionne la vue statique
   * @param {View} view - Vue statique
   */
  setDecoratedView(view) {
    this.#decoratedView = view;

    /** @type {Element} */
    const oldView = this.getElementView()
      .querySelector('template');
    if (!oldView) {
      window.alert(`Erreur de conception : il manque <template></template> dans le decorator [${ view.name }]`);
      return;
    }
    const newView = view.getElementView();
    oldView.parentNode.replaceChild(newView, oldView);
  }
  getDecoratedView() {
    return this.#decoratedView;
  }

  /** @override */
  refreshView(data) {
    const elementView = this.getElementView();
    super.refreshView(data);
    /** @type {Element} */
    const oldView = this.getElementView()
      .querySelector('template');
    oldView.parentNode.replaceChild(elementView, oldView);
  }

  getHtmlView(/* data */) {
    return String.raw`<div class="decorator"><template></template></div>`;
  }

}

export default DecoratorView;