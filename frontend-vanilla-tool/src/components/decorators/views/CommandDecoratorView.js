import DecoratorView from './DecoratorView.js';
/** @import View from '../../views/View.js'; */

class CommandDecoratorView extends DecoratorView {

  name = 'CommandDecoratorView';

  /**
   * @constructor
   * @param {View} view
   */
  constructor(view) {
    super(view);
  }

  getHtmlView() {
    return String.raw`<template id="decoratedSpace" class="command--decorator"></template>`;
  }

  showSpinner() {
    this.getElementView().classList.add('loading');
  }

  hideSpinner() {
    this.getElementView().classList.remove('loading');
  }

}

export default CommandDecoratorView;