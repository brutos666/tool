import TreeUtilities from '../../../tools/TreeUtilities.js';
import ActionButtonView from '../../views/ActionButtonView.js';
import DecoratorView from './DecoratorView.js';
/** @import View from '../../views/View.js'; */

class TreeView extends DecoratorView {

  name = 'TreeView';

  #treeItem;
  #toggleActionButton;
  #parentView;

  /**
   * @constructor
   * @param {View} view
   */
  constructor(view) {
    super(view);
    this.#toggleActionButton = new ActionButtonView({ id: 'toggle', label: 'Ouvrir/Fermer le noeud', type: 'icon', icon: '', role: 'none' });
    this.#toggleActionButton.setDoActionCallback(() => {
      this.toggleTree();
    });
    this.setStaticView('toggle', this.#toggleActionButton);
    this.#treeItem = this.getElementView()
      .querySelector('.tree__item');
  }

  getHtmlView() {
    return String.raw`<li role="none" class="tree list__element">
      <div class="tree__item" role="treeitem">
        <template id="toggle" class="tree__toggle icon-button clickable" tabindex="-1" ></template>
        <template id="decoratedSpace" class="tree__content"></template>
        <template id="treeList" class="tree__list" role="group"></template>
      </div></li>`;
  }

  setOpen(open) {
    if (!this.isLeaf()) {
      if (open) {
        TreeUtilities.openNode(this.#treeItem);
      } else {
        TreeUtilities.closeNode(this.#treeItem);
      }
    }
  }
  isClosed() {
    return !this.isLeaf() && TreeUtilities.isClosed(this.#treeItem);
  }
  isOpened() {
    return !this.isLeaf() && TreeUtilities.isOpened(this.#treeItem);
  }

  toggleTree() {
    this.setOpen(TreeUtilities.isClosed(this.#treeItem));
  }

  setRoot() {
    this.getElementView().classList.add('tree--root');
  }
  setLeaf(leaf) {
    if (leaf) {
      const classList = this.getElementView().classList;
      classList.remove('tree--node');
      classList.add('tree--leaf');
      this.#toggleActionButton.getElementView().disabled = true;
      return;
    }
    const classList = this.getElementView().classList;
    classList.remove('tree--leaf');
    classList.add('tree--node');
    this.#toggleActionButton.getElementView().disabled = false;
  }
  isLeaf() {
    return this.getElementView().classList.contains('tree--leaf');
  }
  setTreeItemId(treeItemId) {
    this.getElementView()
      .setAttribute('data-tree-item-id', treeItemId);
  }

  added(parent) {
    super.added(parent);
    this.#parentView = parent;
  }

  getParentView() {
    return this.#parentView;
  }

}

export default TreeView;