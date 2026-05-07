import DecoratorView from './DecoratorView.js';
import ActionButtonView from '../../views/ActionButtonView.js';
/** @import View from '../../views/View.js'; */

class TreeView extends DecoratorView {

  name = 'TreeView';

  #treeItem;

  /**
   * @constructor
   * @param {View} view
   */
  constructor(view) {
    super(view);
    const toggleAction = new ActionButtonView({ id: 'toggle', label: 'Ouvrir/Fermer le noeud', type: 'icon', icon: '', role: 'none' });
    toggleAction.setDoActionCallback(() => {
      this.toggleTree();
    });
    this.setStaticView('toggle', toggleAction);
    this.#treeItem = this.getElementView()
      .querySelector('#treeItem');
  }

  getHtmlView() {
    return String.raw`<li role="none" id="tree" class="tree">
      <div id="treeItem" class="tree__item" role="treeitem">
        <template id="toggle" class="tree__toggle icon-button clickable" tabindex="-1" ></template>
        <template id="decoratedSpace" class="tree__content"></template>
        <template id="treeList" class="tree__list" role="group"></template>
      </div></li>`;
  }

  setOpen(open) {
    if (!this.isLeaf()) {
      this.#treeItem.setAttribute('aria-expanded', open ? 'true' : 'false');
      this.getStaticView('treeList')
        .getElementView()
        .getAttribute('id');
    }
  }

  toggleTree() {
    this.setOpen(this.#treeItem.getAttribute('aria-expanded') === 'false');
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

}

export default TreeView;