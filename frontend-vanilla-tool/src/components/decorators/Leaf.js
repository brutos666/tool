import ActionButton from '../ActionButton.js';
import Toolbar from '../Toolbar.js';
import Decorator from './Decorator.js';
import LeafView from './views/LeafView.js';

class Leaf extends Decorator {

  name = 'Leaf';
  /**
   * @constructor
   * @param {Component} decoratedElement - Composant auquel on ajoute le decorator
   * @param {Function} addToLeafCallback - Fonction appelée lorsqu'on ajoute un élément à une feuille
   */
  constructor(decoratedElement, addToLeafCallback) {
    super(new LeafView(decoratedElement.getView()), decoratedElement);

    const toolbar = new Toolbar();
    const addNewChildAction = new ActionButton({ id: 'addNewChild', label: '+' });
    addNewChildAction.setDoActionCallback(addToLeafCallback.bind(this));
    toolbar.addChild(addNewChildAction);
    this.setStaticChild('toolbar', toolbar);
  }
  setRoot() {
    this.getView()
      .setRoot();
  }

}

export default Leaf;