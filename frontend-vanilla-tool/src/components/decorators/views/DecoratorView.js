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
    this.setDecoratorSpace(view);
  }

  getHtmlView(/* data */) {
    return String.raw`<div class="decorator">${ this.getTemplateDecoratorHTML() }</div>`;
  }
  getTemplateDecoratorHTML() {
    return String.raw`<template id="decoratedSpace"></template>`;
  }

  added() {
    super.added();
    this.#decoratedView.added();
  }
  addedToParent(parent) {
    super.addedToParent(parent);
    this.#decoratedView.addedToParent(parent);
  }

  /**
   * Positionne la vue statique
   * @param {View} view - Vue statique
   */
  setDecoratedView(view) {
    this.#decoratedView = view;
  }
  setDecoratorSpace(view) {
    /** @type {Element} */
    const oldView = this.getElementView()
      .querySelector('#decoratedSpace');
    if (!oldView) {
      const error = `Erreur de conception : il manque ${ this.getTemplateDecoratorHTML() } dans le decorator [${ this.getName() }]`;
      window.alert(error);
      throw new Error(error);
    }
    const newView = view.getElementView();
    oldView.classList.forEach(classItem => newView.classList.add(classItem));
    oldView.parentNode.replaceChild(newView, oldView);
  }
  /**
   * Retourne la vue décorée
   * @returns {View} Vue décorée
   */
  getDecoratedView() {
    if (this.#decoratedView.getDecoratedView) {
      return this.#decoratedView.getDecoratedView();
    }
    return this.#decoratedView;
  }
  getImmediateDecoratedView() {
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

  setReadOnly() {
    // Par défaut, seul l'élément décoré passe en readOnly. Si un décorateur doit se comporter différemment, il faut surcharger cette fonction
    this.getDecoratedView()
      .setReadOnly();
  }

  setDisabled() {
    this.getDecoratedView()
      .setDisabled();
  }

  setEnabled() {
    this.getDecoratedView()
      .setEnabled();
  }

}

export default DecoratorView;