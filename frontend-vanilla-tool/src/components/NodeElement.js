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

  /**
   * Cette méthode est appelée lorsque la commande est en cours
   * @param {string} name - Nom de la commande
   */
  // eslint-disable-next-line no-unused-vars
  commandInProgress(name) {
    this.getView()
      .showSpinner();
  }

  /**
   * Cette méthode est appelée lorsque la commande est terminée
   * @param {string} name - Nom de la commande
   * @param {Object} response - Résultat de la commande
   */
  // eslint-disable-next-line no-unused-vars
  commandDone(name, response) {
    this.getView()
      .hideSpinner();
  }

  /**
   * Cette méthode est appelée lorsque la commande a échoué
   * @param {string} name - Nom de la commande
   * @param {string} error - Résultat de la commande
   */
  // eslint-disable-next-line no-unused-vars
  commandFailed(name, error) {
    this.getView()
      .showSpinner();
  }

}

export default NodeElement;