'use strict';

import View from './views/View.js';

class NodeElement {

  #view;

  /**
   * Constructeur
   * @param {View} view - objet donnant l'affichage du composant. Peut définir plusieurs affichages
   */
  constructor(view) {
    this.#view = view === undefined ? new View() : view;
  }

  /** Donne la vue pour permettre de modifier l'affichage si besoin */
  getView() {
    return this.#view;
  }

  createView(htmlText) {
    this.#view.createView(htmlText);
  }

  getNodeView() {
    return this.#view.getNodeView();
  }

  getElementView() {
    return this.#view.getElementView();
  }

  setError(value) {
    this.#view.setError(value);
  }

  setSuccess(value) {
    this.#view.setSuccess(value);
  }

}

export default NodeElement;