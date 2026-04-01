import Decorator from './Decorator.js';
import Leaf from './Leaf.js';
import TreeView from './views/TreeView.js';
/** @import Composite from '../Composite.js'; */

class Tree extends Decorator {

  name = 'Tree';

  #isLeafCallback = () => { return true; };

  /**
   * @constructor
   * @param {Composite} element
   */
  constructor(element) {
    super(new TreeView(element.getView()), element);
    this.setChildren(element.getChildren());
  }
  /**
   * Méthode appelée pour savoir si l'élément ajouté est un noeud est une feuille ou non
   * La méthode doit attendre en entrée l'élément ajouté
   * @param {Function} callback - Fonction appelée pour savoir si l'élément ajouté est un noeud
   */
  setIsLeafCallback(callback) {
    this.#isLeafCallback = callback;
  }
  /**
   * @override
   * @returns {TreeView}
   */
  getView() {
    return super.getView();
  }

  setChildren(children) {
    super.setChildren(children.map(child => this.getTreeElement(child)));
  }

  getTreeElement(element) {
    if (this.#isLeafCallback(element)) {
      return new Leaf(element);
    }
    const tree = new Tree(element);
    tree.setIsLeafCallback(this.#isLeafCallback);
    return tree;
  }

  setOpen() {
    this.getView()
      .setOpen();
  }

}

export default Tree;