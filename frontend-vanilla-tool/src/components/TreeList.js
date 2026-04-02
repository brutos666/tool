import Composite from './Composite.js';
import Leaf from './decorators/Leaf.js';
import Tree from './decorators/Tree.js';
import TreeListView from './views/TreeListView.js';

class TreeList extends Composite {

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
   * @override
   * @param {Composite} element : élément ajouté à la liste
   */
  addChild(element) {
    super.addChild(this.getTreeElement(element));
  }
  /**
   * @override
   * @param {Array<Composite>} children
   */
  setChildren(children) {
    super.setChildren(children.map(child => {
      const treeElement = this.getTreeElement(child);
      if (!child.getParent()) {
        treeElement.setRoot();
      }
      return treeElement;
    }));
  }
  /**
   * @override
   * @param {Composite} element : élément ajouté à la liste
   */
  getTreeElement(element) {
    return element.getChildren().length === 0 ? new Leaf(element, addElementToLeaf) : new Tree(element);
  }

}
/**
 * Méthode pour ajouter un élément à une feuille
 * @this {Leaf}
 */
function addElementToLeaf() {
  const tree = new Tree(this.getDecoratedElement());
  tree.addNewChild();
  this.getParent()
    .replaceChild(tree, this);
}

export default TreeList;