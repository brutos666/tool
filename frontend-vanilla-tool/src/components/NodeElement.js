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
  /**
   * Ajoute un enfant statique
   * @param {String} id
   * @param {Component} child
   */
  setStaticChild(id, child) {
    this.getView()
      .setStaticView(id, child.getView());
  }
  /**
   * Donne la vue pour permettre de modifier l'affichage si besoin
   * @returns {View}
   */
  getView() {
    return this.#view;
  }

  /**
   * Retourne le noeud HTML contenant l'élément et des balises propres à tous les éléments
   * @returns {HTMLElement}
   */
  getNodeView() {
    return this.getView()
      .getNodeView();
  }

  /**
   * Retourne le noeud HTML contenant l'élément
   * @returns {HTMLElement}
   */
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

}

export default NodeElement;