'use strict';

import View from './views/View.js';
/** @import FocusManager from './FocusManager.js'; */

class NodeElement {

  name = 'NodeElement';

  #view;
  #staticChildren = {};
  #name;

  /** @type {FocusManager} (facultatif) */
  #focusManager;

  /**
   * @constructor
   * @param {View} view - objet donnant l'affichage du composant. Peut définir plusieurs affichages
   */
  constructor(view) {
    this.#name = this.constructor.name;
    this.#view = view === undefined ? new View() : view;
  }
  getName() {
    return this.#name;
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

    child.added(this);
  }
  /**
   * Retourne un enfant statique
   * @param {string} id - Identifiant de l'enfant statique
   * @returns {Component} - Enfant statique
   */
  getStaticChild(id) {
    return this.#staticChildren[id];
  }

  destroy() {
    this.#focusManager?.disableKeyNavigation();
    // destroy de tous les staticChild
    Object.values(this.#staticChildren)
      .forEach(child => child.destroy());
    this.getView()
      .destroy();
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

  setFocusManager(focusManager) {
    this.#focusManager = focusManager;
  }
  getFocusManager() {
    return this.#focusManager;
  }

  giveFocus() {
    this.getView()
      .giveFocus();
  }
  isFocused() {
    return this.getView()
      .isFocused();
  }
  setTabIndex(value) {
    this.getView()
      .setTabIndex(value);
  }
  removeTabIndex(value) {
    this.getView()
      .removeTabIndex(value);
  }
  setCurrent() {
    this.getView()
      .setCurrent();
  }

  removeCurrent() {
    this.getView()
      .removeCurrent();
  }

  isCurrent() {
    return this.getView()
      .isCurrent();
  }
  isOnCurrentBranch() {
    return this.getView()
      .isOnCurrentBranch();
  }

  setDisabled() {
    this.getView()
      .setDisabled();
    // Rendre tous les enfants en lecture seule
    for (const child in this.#staticChildren) {
      this.#staticChildren[child].setDisabled();
    }
  }

  setEnabled() {
    this.getView()
      .setEnabled();
    // Rendre tous les enfants en lecture seule
    for (const child in this.#staticChildren) {
      this.#staticChildren[child].setEnabled();
    }
  }

  isDisabled() {
    return this.getView()
      .isDisabled();
  }

  setHidden() {
    this.getView()
      .setHidden();
  }
  isHidden() {
    return this.getView()
      .isHidden();
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