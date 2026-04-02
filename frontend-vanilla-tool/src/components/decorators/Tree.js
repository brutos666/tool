import TreeList from '../TreeList.js';
import Decorator from './Decorator.js';
import TreeView from './views/TreeView.js';
import Toolbar from '../Toolbar.js';
import ActionButton from '../ActionButton.js';
/** @import Composite from '../Composite.js'; */

class Tree extends Decorator {

  name = 'Tree';

  #treeList;

  /**
   * @constructor
   * @param {Composite} decoratedElement
   */
  constructor(decoratedElement) {
    super(new TreeView(decoratedElement.getView()), decoratedElement);
    const toolbar = new Toolbar();
    const addNewChildAction = new ActionButton({ id: 'addNewChild', label: '+' });
    // On ajoute l'élément au modèle
    addNewChildAction.setDoActionCallback(decoratedElement.addNewChild.bind(this));
    toolbar.addChild(addNewChildAction);
    this.setStaticChild('toolbar', toolbar);

    this.#treeList = new TreeList();
    this.#treeList.setChildren(decoratedElement.getChildren());
    this.setStaticChild('treeList', this.#treeList);

    // TODO : transformation d'un noeud en feuille et inversement
  }

  /**
   * @override
   * @returns {TreeView}
   */
  getView() {
    return super.getView();
  }
  /**
   * @override
   * @returns {Composite}
   */
  getDecoratedElement() {
    return super.getDecoratedElement();
  }

  addChild(element) {
    this.#treeList.addChild(element);
  }
  addNewChild() {
    super.addNewChild();
    this.setOpen();
  }

  setOpen() {
    this.getView()
      .setOpen();
  }

  setRoot() {
    this.getView()
      .setRoot();
  }

}

export default Tree;