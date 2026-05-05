import DecoratorView from './DecoratorView.js';
import ActionButtonView from '../../views/ActionButtonView.js';
/** @import View from '../../views/View.js'; */

class TreeView extends DecoratorView {

  name = 'TreeView';

  #toggle;
  #treeItem;

  /**
   * @constructor
   * @param {View} view
   */
  constructor(view) {
    super(view);
    const toggleAction = new ActionButtonView({ id: 'toggle', label: 'Ouvrir/Fermer le noeud', type: 'icon', icon: '', role: 'icon' });
    toggleAction.setDoActionCallback(() => {
      this.setOpen(!toggleAction.getElementView().classList.contains('tree--open'));
    });
    this.setStaticView('toggle', toggleAction);
    this.#toggle = toggleAction.getElementView();
    this.#treeItem = this.getElementView()
      .querySelector('#treeItem');
  }

  getHtmlView() {
    return String.raw`<li role="none" aria-expanded="false" id="tree" class="tree">
      <div id="treeItem" class="tree__item" role="treeitem">
        <template id="toggle" class="tree__toggle icon-button clickable"></template>
        ${ super.getTemplateDecoratorHTML() }
      </div>
      <template id="treeList" class="tree__list" role="group"></template></li>`;
  }

  setOpen(open) {
    if (open) {
      this.#toggle.classList.add('tree--open');
      this.#treeItem.setAttribute('aria-expanded', 'true');
      return;
    }
    this.#toggle.classList.remove('tree--open');
    this.#treeItem.setAttribute('aria-expanded', 'false');
  }

  setRoot() {
    this.getElementView().classList.add('tree--root');
  }
  setLeaf(leaf) {
    if (leaf) {
      const classList = this.getElementView().classList;
      classList.remove('tree--node');
      classList.add('tree--leaf');
      this.#toggle.classList.add('hidden');
      this.getElementView()
        .setAttribute('role', 'treeitem');
      return;
    }
    const classList = this.getElementView().classList;
    classList.remove('tree--leaf');
    classList.add('tree--node');
    this.#toggle.classList.remove('hidden');
  }

}

export default TreeView;