import Action from './Action.js';
import DragButtonView from './views/DragButtonView.js';

class DragButton extends Action {

  name = 'DragButton';

  /**
   * @constructor
   * @param {Component} dragElement - Element sur lequel se produit le drag&drop
   * @param {'move'|'reorder'} icon - Icône
   */
  constructor(dragElement, icon) {
    super(new DragButtonView(icon));

    this.getView()
      .setDragElementView(dragElement.getView());
  }

}

export default DragButton;