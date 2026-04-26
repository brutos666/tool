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

    const elementView = this.getElementView();
    this.#toggle = elementView.querySelector('#toggle');
    this.#toggle.addEventListener('click', () => {
      this.setOpen(!this.#toggle.classList.contains('tree--open'));
    });
    this.#treeItemNode = elementView.querySelector('#treeItem');
    this.#treeItemNode.addEventListener('focus', this.onFocus.bind(this), true);
    this.#treeItemNode.addEventListener('blur', this.onBlur.bind(this), true);
  }

  setOnFocusCallback(onFocusCallback) {
    this.#onFocusCallback = onFocusCallback;
  }

  getHtmlView() {
    return String.raw`<div id="tree" class="tree">
      <section class="tree__header"><button id="toggle" class="tree__toggle icon-button clickable">▼</button><div id="treeItem" class="tree__item">${ super.getTemplateDecoratorHTML() }</div></section>
      <template id="treeList" class="tree__list"></template></div>`;
  }

  onFocus(event) {
    if (event.relatedTarget && !this.#treeItemNode.contains(event.relatedTarget)) {
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

  setReadOnly() {
    this.getDecoratedView()
      .setReadOnly();
    this.setClickable();
    this.#treeItemNode.setAttribute('tabindex', 0);
  }

}

export default TreeView;