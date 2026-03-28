'use strict';

import { createNode } from '../../tools/NodeUtilities.js';
import { NOTIFICATION_TIMEOUT } from '../../tools/Constants.js';

class View {

  #nodeView;
  #elementView;
  #messageView;

  /**
   * @constructor. Crée la vue à partir des données passées en paramètre
   * @param {Object} data - Données à utiliser pour créer la vue
   */
  constructor(data) {
    this.createView(data);
  }

  /**
   * Retourne le code HTML de la vue
   * @param {Object} [data] - Données à utiliser pour créer la vue
   * @returns {string} - Code HTML de la vue
   */
  getHtmlView(/* data */) {
    return '<div></div>';
  }

  /**
   * Crée la vue à partir des données passées en paramètre
   * @param {Object} data - Données à utiliser pour créer la vue
   */
  createView(data) {
    const htmlView = this.getHtmlView(data);

    this.#elementView = createNode(htmlView);

    this.#messageView = document.createElement('div');
    this.#messageView.classList.add('message');

    this.#nodeView = document.createElement('div');
    this.#nodeView.appendChild(this.#elementView);
    this.#nodeView.appendChild(this.#messageView);
  }

  /**
   * Redessine la vue en fonction des données passées en paramètre.
   * NOTE : pour un champ de saisie, on perdre l'historique des saisies (Ctrl+Z/Ctrl+Y)
   * Pour y remédier, il faut override cette fonction
   * @param {Object} data - Données à utiliser pour redessiner la vue
   */
  refreshView(data) {
    const htmlView = this.getHtmlView(data);
    const nodeElement = createNode(htmlView);
    this.#elementView.parentNode.replaceChild(nodeElement, this.#elementView);
    this.#elementView = nodeElement;
  }

  getNodeView() {
    return this.#nodeView;
  }

  getElementView() {
    return this.#elementView;
  }

  setElementView(value) {
    this.#elementView = value;
  }

  setError(value) {
    this.#messageView.textContent = value;
    this.#messageView.classList.add('error-mess');
    this.#messageView.classList.remove('success-mess');
  }

  setSuccess(value) {
    this.#messageView.textContent = value;
    this.#messageView.classList.remove('error-mess');
    this.#messageView.classList.add('success-mess');
    // Effacer le message au bout d'un peu de temps
    setTimeout(() => this.#messageView.textContent = '', NOTIFICATION_TIMEOUT);
  }

}

export default View;