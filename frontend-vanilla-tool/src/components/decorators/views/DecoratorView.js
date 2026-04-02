import CompositeView from '../../views/CompositeView.js';
/** @import View from '../../views/View.js'; */

class DecoratorView extends CompositeView {

  name = 'DecoratorView';

  /**
   * @constructor
   * @param {View} view
   */
  constructor(view) {
    super();
    this.setDecoratedView(view);
  }

  /**
   * Positionne la vue statique
   * @param {View} view - Vue statique
   */
  setDecoratedView(view) {
    /** @type {Element} */
    const oldView = this.getNodeView()
      .querySelector('template');
    if (!oldView) {
      window.alert(`Erreur de conception : il manque <template></template> dans le decorator [${ view.name }]`);
      return;
    }
    const newView = view.getNodeView();
    oldView.parentNode.replaceChild(newView, oldView);

    super.setElementView(newView);
  }

  getHtmlView(/* data */) {
    return String.raw`<div class="decorator"><template></template></div>`;
  }

}

export default DecoratorView;