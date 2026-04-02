import DecoratorView from './DecoratorView.js';
/** @import View from '../../views/View.js'; */

class LeafView extends DecoratorView {

  name = 'LeafView';
  /**
   * @constructor
   * @param {DecoratorView} view
   */
  constructor(view) {
    super(view);
  }
  /** @override */
  getSpaceChildren() {
    return document.createElement('div');
  }

  getHtmlView() {
    return String.raw`<div class="tree__leaf"><div class="tree__item"><template></template><menu id="toolbar"></menu></div></div>`;
  }
  setRoot() {
    this.getNodeView().classList.add('tree__root');
  }

}

export default LeafView;