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
    if (element.getChildren().length === 0) {
      return new Leaf(element);
    }
    return new Tree(element);
  }

}

export default TreeList;