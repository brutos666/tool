'use strict';

import View from './views/View.js';

class NodeElement {

  #view;

  /**
   * @constructor
   * @param {View} view - objet donnant l'affichage du composant. Peut définir plusieurs affichages
   */
  constructor(view) {
    this.#view = view === undefined ? new View() : view;
  }

  /** Donne la vue pour permettre de modifier l'affichage si besoin */
  getView() {
    return this.#view;
  }

  getNodeView() {
    return this.#view.getNodeView();
  }

  getElementView() {
    return this.#view.getElementView();
  }

  /**
   * Met à jour les données d'un enfant
   * @param {Object} data - Données à mettre à jour
   */
  updateData(data) {
    this.#view.refreshView(data);
  }

  setError(value) {
    this.#view.setError(value);
  }

  setSuccess(value) {
    this.#view.setSuccess(value);
  }

}

export default NodeElement;