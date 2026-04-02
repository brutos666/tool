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
    super.setChildren(children.map(child => this.getTreeElement(child)));
  }
  /**
   * @override
   * @param {Composite} element : élément ajouté à la liste
   */
  getTreeElement(element) {
    const treeElement = element.getChildren().length === 0 ? new Leaf(element) : new Tree(element);
    if (!element.getParent()) {
      treeElement.setRoot();
    }
    return treeElement;
  }

}

export default TreeList;