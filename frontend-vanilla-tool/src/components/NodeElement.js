'use strict';

import { createNode } from '../tools/NodeUtilities.js';
import { NOTIFICATION_TIMEOUT } from '../tools/Constants.js';

class NodeElement {

  #nodeView;
  #elementView;
  #messageView;

  constructor() {
    // this.createView(String.raw`<div></div>`);
  }

  createView(htmlText) {
    this.#elementView = createNode(htmlText);

    this.#messageView = document.createElement('div');
    this.#messageView.classList.add('message');

    this.#nodeView = document.createElement('div');
    this.#nodeView.appendChild(this.#elementView);
    this.#nodeView.appendChild(this.#messageView);
  }

  getNodeView() {
    return this.#nodeView;
  }

  getElementView() {
    return this.#elementView;
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

export default NodeElement;