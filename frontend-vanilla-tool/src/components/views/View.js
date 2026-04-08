'use strict';

import { createNode } from '../../tools/NodeUtilities.js';

class View {

  #nodeView;
  #elementView;

  /** @type {Object.<string, View>} */
  #staticViews = {};

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
   * Positionne la vue statique
   * @param {string} id - Identifiant de la vue statique. Il s'agit de l'attribut id de l'element HTML
   * @param {View} view - Vue statique
   */
  setStaticView(id, view) {
    const oldView = this.#staticViews[id];
    if (oldView) {
      oldView.getNodeView().parentNode.replaceChild(view.getNodeView(), oldView.getNodeView());
      this.#staticViews[id] = view;
      return;
    }
    /** @type {Element} */
    const templateNode = this.getNodeView()
      .querySelector(`#${ id }`);
    if (!templateNode) {
      window.alert(`Erreur de conception : on tente d'accéder à un élément qui n'a pas été défini [${ id }]`);
      return;
    }
    templateNode.classList.forEach(classItem => view.getElementView().classList.add(classItem));
    templateNode.parentNode.replaceChild(view.getNodeView(), templateNode);
    this.#staticViews[id] = view;
  }

  /**
   * Crée la vue à partir des données passées en paramètre
   * @param {Object} data - Données à utiliser pour créer la vue
   */
  createView(data) {
    const htmlView = this.getHtmlView(data);
    this.#elementView = createNode(htmlView);
    this.#nodeView = this.#elementView;
  }

  /**
   * Redessine la vue en fonction des données passées en paramètre.
   * NOTE : pour un champ de saisie, on peut perdre l'historique des saisies (Ctrl+Z/Ctrl+Y)
   * Pour y remédier, il faut override cette fonction
   * @param {Object} data - Données à utiliser pour redessiner la vue
   */
  refreshView(data) {
    const htmlView = this.getHtmlView(data);
    const nodeElement = createNode(htmlView);
    this.#nodeView.parentNode.replaceChild(nodeElement, this.#nodeView);
    this.#nodeView = nodeElement;
    for (const id in this.#staticViews) {
      const view = this.#staticViews[id];
      delete this.#staticViews[id];
      this.setStaticView(id, view);
    }
  }

  /**
   *
   * @returns {HTMLElement}
   */
  getNodeView() {
    return this.#nodeView;
  }

  getElementView() {
    return this.#elementView;
  }

  setElementView(view) {
    this.#elementView = view;
  }

  setDisabled() {
    this.getElementView().classList.add('disabled');
  }

  setEnabled() {
    this.getElementView().classList.remove('disabled');
  }

  isDisabled() {
    return this.getElementView().classList.contains('disabled');
  }

  setHidden() {
    this.getElementView().classList.add('hidden');
  }
  setVisible() {
    this.getElementView().classList.remove('hidden');
  }

  isNode() {
    return false;
  }

}

export default View;