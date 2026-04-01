import Composite from './Composite.js';
import Leaf from './decorators/Leaf.js';
import Tree from './decorators/Tree.js';
import TreeListView from './views/TreeListView.js';
/** @import Component from './Component.js' */

class TreeList extends Composite {

  #isLeafCallback = () => { return true; };

  constructor() {
    super(new TreeListView());
  }
  /**
   * @override
   * @returns {TreeListView}
   */
  getView() {
    return super.getView();
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
   * @param {Component} element : élément ajouté à la liste
   */
  addChild(element) {
    super.addChild(this.getTreeElement(element));
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

}

export default TreeList;