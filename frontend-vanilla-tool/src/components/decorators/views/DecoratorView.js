import View from '../../views/View.js';

class DecoratorView extends View {

  name = 'DecoratorView';

  #decoratedView;

  /**
   * @constructor
   * @param {View} view
   * @param {Object} data - Données à utiliser pour créer la vue
   */
  constructor(view, data) {
    super(data);
    this.setDecoratedView(view);
  }

  getHtmlView(/* data */) {
    return String.raw`<div class="decorator">${ this.getTemplateDecoratorHTML() }</div>`;
  }
  getTemplateDecoratorHTML() {
    return String.raw`<template id="decoratedSpace"></template>`;
  }

  /**
   * Positionne la vue statique
   * @param {View} view - Vue statique
   */
  setDecoratedView(view) {
    this.#decoratedView = view;

    /** @type {Element} */
    const oldView = this.getElementView()
      .querySelector('#decoratedSpace');
    if (!oldView) {
      const error = `Erreur de conception : il manque ${ this.getTemplateDecoratorHTML() } dans le decorator [${ this.getName() }]`;
      window.alert(error);
      throw new Error(error);
    }
    const newView = view.getElementView();
    oldView.parentNode.replaceChild(newView, oldView);
  }
  getDecoratedView() {
    return this.#decoratedView;
  }

  /** @override */
  refreshView(data) {
    const elementView = this.getElementView();
    super.refreshView(data);
    /** @type {Element} */
    const oldView = this.getElementView()
      .querySelector('template');
    oldView.parentNode.replaceChild(elementView, oldView);
  }

}

export default DecoratorView;