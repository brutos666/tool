import ClassDecoratorView from './ClassDecoratorView.js';
/** @import View from '../../views/View.js'; */

class CommandDecoratorView extends ClassDecoratorView {

  name = 'CommandDecoratorView';

  /**
   * @constructor
   * @param {View} view
   */
  constructor(view) {
    super(view, 'command--decorator');
  }

  showSpinner() {
    this.getElementView().classList.add('loading');
  }

  hideSpinner() {
    this.getElementView().classList.remove('loading');
  }

}

export default CommandDecoratorView;