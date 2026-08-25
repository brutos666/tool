import ActionButton from '../ActionButton.js';
import PopupFocusManager from '../PopupFocusManager.js';
import Toolbar from '../Toolbar.js';
import ItemDecorator from './ItemDecorator.js';
import ListItemDecoratorView from './views/ListItemDecoratorView.js';
/** @import Component from '../Component.js'; */

class ListItemDecorator extends ItemDecorator {

  name = 'ListItemDecorator';

  /**
   * @constructor
   * @param {Component} decoratedElement
   */
  constructor(decoratedElement) {
    super(new ListItemDecoratorView(decoratedElement.getView()), decoratedElement);

    const footerToolbar = new Toolbar();
    const enterButton = new ActionButton({ id: 'enter', label: 'Entrer en mode édition', icon: 'pencil', role: 'button', type: 'icon' });
    enterButton.setDoActionCallback(() => {
      this.getFocusManager()
        .accessToComponent();
    });
    footerToolbar.addChild(enterButton);
    this.setStaticChild('footerToolbar', footerToolbar);

    const focusManager = new PopupFocusManager(this.getElementView(), 'vertical', false, true);
    super.setFocusManager(focusManager);
    focusManager.setComponentToAccess(decoratedElement);
    focusManager.addComponent(footerToolbar);
    focusManager.setCurrent(footerToolbar);
  }

  enterIn() {
    this.getFocusManager()
      .accessToComponent();
  }

}

export default ListItemDecorator;