'use strict';

import View from './views/View.js';

class NodeElement {

  #view;
  #staticChildren = {};

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
    if (this.#staticChildren[id]) {
      this.#staticChildren[id].destroy();
    }
    this.getView()
      .setStaticView(id, child.getView());
    this.#staticChildren[id] = child;
  }
  destroy() {
    // destroy de tous les staticChild
    Object.values(this.#staticChildren)
      .forEach(child => child.destroy());
  }
  /**
   * Donne la vue pour permettre de modifier l'affichage si besoin
   * @returns {View}
   */
  getView() {
    return this.#view;
  }

  changeView(data, view) {
    const elementView = this.getElementView();
    this.#view = view;
    this.getView()
      .setElementView(elementView);
    this.getView()
      .refreshView(data);
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
   * Met à jour les données d'un enfant qui influent sur la vue
   * @param {Object} data - Données à mettre à jour
   */
  updateData(data) {
    this.getView()
      .refreshView(data);
  }
  setDisabled() {
    this.getView()
      .setDisabled();
  }

  setEnabled() {
    this.getView()
      .setEnabled();
  }

  isDisabled() {
    return this.getView()
      .isDisabled();
  }

  setHidden() {
    this.getView()
      .setHidden();
  }

  setVisible() {
    this.getView()
      .setVisible();
  }

  setReadOnly() {
    this.getView()
      .setReadOnly();
    // Rendre tous les enfants en lecture seule
    for (const child in this.#staticChildren) {
      this.#staticChildren[child].setReadOnly();
    }
  }

}

export default NodeElement;