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
    return this.getView()
      .getNodeView();
  }

  getElementView() {
    return this.getView()
      .getElementView();
  }

  /**
   * Met à jour les données d'un enfant
   * @param {Object} data - Données à mettre à jour
   */
  updateData(data) {
    this.getView()
      .refreshView(data);
  }

  setError(value) {
    this.getView()
      .setError(value);
  }

  setSuccess(value) {
    this.getView()
      .setSuccess(value);
  }

}

export default NodeElement;