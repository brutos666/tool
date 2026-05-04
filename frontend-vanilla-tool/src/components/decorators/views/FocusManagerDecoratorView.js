import DecoratorView from './DecoratorView.js';

class FocusManagerDecoratorView extends DecoratorView {

  name = 'FocusManagerDecoratorView';
  /**
   * @constructor
   * @param {View} view
   */
  constructor(view) {
    super(view);
  }

  getHtmlView() {
    return String.raw`<template id="decoratedElement" class="focus-manager--decorator"></template>`;
  }

}

export default FocusManagerDecoratorView;