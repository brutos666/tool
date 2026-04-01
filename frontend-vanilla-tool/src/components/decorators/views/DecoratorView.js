import CompositeView from '../../views/CompositeView.js';
/** @import View from '../../views/View.js'; */

class DecoratorView extends CompositeView {

  name = 'DecoratorView';

  /**
   * @constructor
   * @param {string} id
   * @param {View} view
   */
  constructor(id, view) {
    super();
    this.setStaticView(id, view);
    this.setElementView(this.getStaticView(id)
      .getNodeView());
  }

  getHtmlView(/* data */) {
    return String.raw`<div class="decorator"><template id="element"></template></div>`;
  }

}

export default DecoratorView;