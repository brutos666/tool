'use strict';

import Component from './Component.js';
class Button extends Component {

  constructor(data) {
    super(data);
    this.createView(String.raw`<button id="${ data.id }">${ data.label }</button>`);
    this.getNodeView()
      .addEventListener('click', data.onClick);
  }

}

export default Button;