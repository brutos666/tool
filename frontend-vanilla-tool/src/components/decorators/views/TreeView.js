import TreeUtilities from '../../../tools/TreeUtilities.js';
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
    return String.raw`<div class="tree" role="treeitem">
        <template id="toggle" class="tree__toggle icon-button clickable" tabindex="-1" ></template>
        <template id="decoratedSpace" class="tree__content"></template>
        <template id="treeList" class="tree__list" role="group"></template>
      </div>`;
  }

  setOpen(open) {
    if (!this.isLeaf()) {
      if (open) {
        TreeUtilities.openNode(this.getElementView());
      } else {
        TreeUtilities.closeNode(this.getElementView());
      }
    }
  }
  isClosed() {
    return !this.isLeaf() && TreeUtilities.isClosed(this.getElementView());
  }
  isOpened() {
    return !this.isLeaf() && TreeUtilities.isOpened(this.getElementView());
  }

  setRoot() {
    this.getElementView().classList.add('tree--root');
  }
  setLeaf(leaf) {
    if (leaf) {
      const classList = this.getElementView().classList;
      classList.remove('tree--node');
      classList.add('tree--leaf');
      return;
    }
    const classList = this.getElementView().classList;
    classList.remove('tree--leaf');
    classList.add('tree--node');
  }
  isLeaf() {
    return this.getElementView().classList.contains('tree--leaf');
  }
  setTreeItemId(treeItemId) {
    this.getElementView()
      .setAttribute('data-tree-item-id', treeItemId);
  }

  setCurrentTree() {
    this.getElementView().classList.add('current-tree');
  }
  removeCurrentTree() {
    this.getElementView().classList.remove('current-tree');
  }

}

export default TreeView;