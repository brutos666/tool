import DecoratorView from './DecoratorView.js';
/** @import View from '../../views/View.js'; */

class TreeView extends DecoratorView {

  name = 'TreeView';

  #toggle;

  /**
   * @constructor
   * @param {View} view
   * @param {Object} data
   * @param {boolean} data.leaf
   * @param {boolean} data.root
   */
  constructor(view, data) {
    super(view, data);

    const nodeView = this.getNodeView();

    this.#toggle = nodeView.querySelector('#toggle');
    this.#toggle.addEventListener('click', () => {
      this.setOpen(!this.#toggle.classList.contains('tree--open'));
    });
    nodeView.addEventListener('focus', this.onFocus.bind(this), true);
    nodeView.addEventListener('blur', this.onBlur.bind(this), true);
  }

  getHtmlView() {
    return String.raw`<div class="tree">
      <section class="tree__header"><button id="toggle" class="tree__toggle">▼</button><div class="tree__item"><template></template><menu id="toolbar"></menu></div></section>
      <section id="treeList" class="tree__list"></section></div>`;
  }

  onFocus(event) {
    if (!this.getNodeView()
      .contains(event.relatedTarget)) {
      this.setFocused(true);
    }
  }

  onBlur(event) {
    if (!this.getNodeView()
      .contains(event.relatedTarget)) {
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
    this.#toggle.textContent = this.getNodeView().classList.contains('tree--leaf') ? '' : '►';
    this.getStaticView('treeList')
      .getElementView().classList.add('hidden');
  }

  setRoot() {
    this.getNodeView().classList.add('tree--root');
  }
  setLeaf(leaf) {
    if (leaf) {
      const classList = this.getNodeView().classList;
      classList.remove('tree--node');
      classList.add('tree--leaf');
      this.#toggle.classList.add('hidden');
      return;
    }
    const classList = this.getNodeView().classList;
    classList.remove('tree--leaf');
    classList.add('tree--node');
    this.#toggle.classList.remove('hidden');
  }

  setFocused(focused) {
    if (focused) {
      this.getNodeView().classList.add('focused');
    } else {
      this.getNodeView().classList.remove('focused');
    }
  }

  setReadOnly() {
    this.getNodeView().classList.add('tree--readonly');
  }

}

export default TreeView;