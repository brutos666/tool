'use strict';

import Component from './Component.js';
class TextArea extends Component {

  constructor(data) {
    super(data);

    this.createView(String.raw`<div>
            <label for="input">${ data.label }</label>
            <textarea cols="100" rows=10 id="${ data.id }" ></textarea>
        </div>`);
  }

  set value(value) {
    this.getNodeElement().value = value;
  }

}

export default TextArea;