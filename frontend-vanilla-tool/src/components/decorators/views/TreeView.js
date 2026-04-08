import DecoratorView from './DecoratorView.js';
/** @import View from '../../views/View.js'; */

class TreeView extends DecoratorView {

  name = 'TreeView';

  /**
   * @constructor
   * @param {View} view
   * @param {Object} data
   * @param {boolean} data.leaf
   */
  constructor(view, data) {
    super(view, data);
  }

  getHtmlView(data) {
    if (data.leaf) {
      return String.raw`<div class="tree__leaf"><div class="tree__item"><template></template><menu id="toolbar"></menu>
    <section id="treeList" class="tree__list"></section></div></div>`;
    }
    return String.raw`<details class="tree__node">
      <summary><div class="tree__item"><template></template><menu id="toolbar"></menu></div></summary>
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