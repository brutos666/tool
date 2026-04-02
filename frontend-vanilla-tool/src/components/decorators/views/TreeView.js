import DecoratorView from './DecoratorView.js';
/** @import View from '../../views/View.js'; */

class TreeView extends DecoratorView {

  name = 'TreeView';

  /**
   * @constructor
   * @param {View} view
   */
  constructor(view) {
    super('tree', view);
  }

  getHtmlView() {
    return String.raw`<details class="tree__root">
      <summary><template id="tree"></template></summary>
      <section id="treeList" class="tree__list"></section>
    </details>`;
  }

  setOpen() {
    this.getElementView().open = true;
  }

}

export default TreeView;