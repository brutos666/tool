import DecoratorView from './DecoratorView.js';
/** @import View from '../../views/View.js'; */

class TreeView extends DecoratorView {

  name = 'TreeView';

  /**
   * @constructor
   * @param {View} view
   */
  constructor(view) {
    super(view);
  }

  getHtmlView() {
    return String.raw`<details class="tree__node">
      <summary><template></template></summary>
      <section id="treeList" class="tree__list"></section>
    </details>`;
  }

  setOpen() {
    this.getNodeView().open = true;
  }
  setRoot() {
    this.getNodeView().classList.remove('tree__node');
    this.getNodeView().classList.add('tree__root');
  }

}

export default TreeView;