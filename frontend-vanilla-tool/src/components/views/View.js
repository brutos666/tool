'use strict';

import { createNode } from '../../tools/NodeUtilities.js';

class View {

  name = 'View';

  /** @type {Element} */
  #elementView;

  /** @type {Object.<string, View>} */
  #staticViews = {};
  /** @type {Object.<string, Element>} */
  #templateNode = {};

  #name;

  /**
   * @constructor. Crée la vue à partir des données passées en paramètre
   * @param {Object} data - Données à utiliser pour créer la vue
   */
  constructor(data) {
    this.#name = this.constructor.name;
    this.createView(data);
  }

  getName() {
    return this.#name;
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
    /** @type {Element} */
    const templateNode = this.getTemplateNode(id);
    if (!templateNode) {
      const error = new Error(`Erreur de conception : on tente d'accéder à un élément qui n'a pas été défini [${ id }] dans la vue [${ this.getName() }]`);
      window.alert(error);
      throw new Error(error);
    }
    templateNode.classList.forEach(classItem => view.getElementView().classList.add(classItem));
    templateNode.getAttributeNames()
      .filter(name => name !== 'id' && name !== 'class')
      .forEach(name => {
        view.getElementView()
          .setAttribute(name, templateNode.getAttribute(name));
      });

    if (templateNode.parentNode) {
      // Cas où on part du modèle de vue donnée par getHtmlView()
      templateNode.parentNode.replaceChild(view.getElementView(), templateNode);
    } else {
      const oldView = this.getStaticView(id)
        .getElementView();
      // Cas où on remplace la vue static par une autre
      oldView.parentNode.replaceChild(view.getElementView(), oldView);
    }
    this.#staticViews[id] = view;
  }

  getStaticView(id) {
    return this.#staticViews[id];
  }

  getTemplateNode(id) {
    return this.#templateNode[id];
  }

  /**
   * Crée la vue à partir des données passées en paramètre
   * @param {Object} data - Données à utiliser pour créer la vue
   */
  createView(data) {
    const htmlView = this.getHtmlView(data);
    this.#elementView = createNode(htmlView);
    const templateNodes = this.#elementView.querySelectorAll('template');
    for (const templateNode of templateNodes) {
      this.#templateNode[templateNode.id] = templateNode;
    }
  }

  /**
   * Redessine la vue en fonction des données passées en paramètre.
   * @param {Object} data - Données à utiliser pour redessiner la vue
   */
  refreshView(data) {
    const parentNode = this.getElementView().parentNode;
    const oldElementView = this.getElementView();
    this.createView(data);
    parentNode.replaceChild(oldElementView, this.#elementView);
    for (const id in this.#staticViews) {
      const view = this.#staticViews[id];
      this.setStaticView(id, view);
    }
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
  setReadOnly() {
    this.getElementView().classList.add('readonly');
  }
  setClickable() {
    this.getElementView().classList.add('clickable');
  }

  isNode() {
    return false;
  }

  dispatchEvent(event) {
    this.getElementView()
      .dispatchEvent(event);
  }

  addEventListener(event, callback, bubble = false) {
    this.getElementView()
      .addEventListener(event, callback, bubble);
  }

}

export default View;