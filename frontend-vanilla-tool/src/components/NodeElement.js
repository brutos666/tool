'use strict';

import { createNode } from '../tools/NodeUtilities.js';

class NodeElement {

  #data = { id: '', label: '' };
  #nodeView;
  #nodeElement;
  #errorElement;
  #errorMess;

  constructor(data) {
    this.#data = data;
    // this.createView(String.raw`<div id="${data.id}"></div>`);
  }

  createView(htmlText) {
    this.#nodeView = createNode(`<div>${ htmlText }<div class="error-mess"></div></div>`);
    this.#nodeElement = this.#nodeView.id === this.#data.id ? this.#nodeView : this.#nodeView.querySelector(`[id="${ this.#data.id }"]`);
    this.#errorElement = this.#nodeView.querySelector('.error-mess');
  }
  getNodeView() {
    return this.#nodeView;
  }

  getNodeElement() {
    return this.#nodeElement;
  }

  getErrorMess() {
    return this.#errorMess;
  }

  setErrorMess(value) {
    this.#errorMess = value;
    this.#errorElement.textContent = value;
  }

}

export default NodeElement;