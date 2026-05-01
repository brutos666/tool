import DecoratorView from './DecoratorView.js';
/** @import View from '../../views/View.js'; */

class ManagerItemsDecoratorView extends DecoratorView {

  name = 'ManagerItemsDecoratorView';

  /**
   * @constructor
   * @param {View} view
   */
  constructor(view) {
    super(view);
  }

  getHtmlView() {
    return String.raw`<template id="decoratedSpace" class="manager-items--decorator"></template>`;
  }

}

export default ManagerItemsDecoratorView;