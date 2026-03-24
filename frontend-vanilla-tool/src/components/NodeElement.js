'use strict';

import { createNode } from '../tools/NodeUtilities.js';

class NodeElement {

  #nodeView;
  #errorElement;
  #errorMess;

  constructor() {
    // this.createView(String.raw`<div id="${data.id}"></div>`);
  }

  createView(htmlText) {
    this.#nodeView = createNode(`<div>${ htmlText }<div class="error-mess"></div></div>`);
    this.#errorElement = this.#nodeView.querySelector('.error-mess');
  }
  getNodeView() {
    return this.#nodeView;
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