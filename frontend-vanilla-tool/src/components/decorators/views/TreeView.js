import DecoratorView from './DecoratorView.js';
/** @import View from '../../views/View.js'; */

class TreeView extends DecoratorView {

  name = 'TreeView';

  #toggle;
  #treeItemNode;

  #onFocusCallback = () => {};

  /**
   * @constructor
   * @param {View} view
   */
  constructor(view) {
    super(view);
    const toggleAction = new ActionButtonView({ id: 'toggle', label: 'Ouvrir le noeud', type: 'icon', icon: '▼', role: 'icon' });
    toggleAction.setDoActionCallback(() => {
      this.setOpen(!toggleAction.getElementView().classList.contains('tree--open'));
    });
    this.setStaticView('toggle', toggleAction);
    this.#toggle = toggleAction.getElementView();
  }

  setOnFocusCallback(onFocusCallback) {
    this.#onFocusCallback = onFocusCallback;
  }

  getHtmlView() {
    return String.raw`<div id="tree" class="tree">
      <section class="tree__header">
      <template id="toggle" class="tree__toggle icon-button clickable"></template>
      <div id="treeItem" class="tree__item">${ super.getTemplateDecoratorHTML() }</div></section>
      <template id="treeList" class="tree__list"></template></div>`;
  }

  onFocus(event) {
    if (event.relatedTarget === null || !this.#treeItemNode.contains(event.relatedTarget)) {
      this.setFocused(true);
      this.#onFocusCallback();
    }
  }

  onBlur(event) {
    if (!this.#treeItemNode.contains(event.relatedTarget)) {
      this.setFocused(false);
    }
  }

  setOpen(open) {
    if (open) {
      this.#toggle.classList.add('tree--open');
      this.#toggle.textContent = '▼';
      this.getStaticView('treeList')
        .getElementView().classList.remove('hidden');
      return;
    }
    this.#toggle.classList.remove('tree--open');
    this.#toggle.textContent = this.getElementView().classList.contains('tree--leaf') ? '' : '►';
    this.getStaticView('treeList')
      .getElementView().classList.add('hidden');
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
      return;
    }
    const classList = this.getElementView().classList;
    classList.remove('tree--leaf');
    classList.add('tree--node');
    this.#toggle.classList.remove('hidden');
  }

  setFocused(focused) {
    if (focused) {
      this.getElementView().classList.add('focused');
    } else {
      this.getElementView().classList.remove('focused');
    }
  }

}

export default TreeView;