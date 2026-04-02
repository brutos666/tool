import TreeList from '../TreeList.js';
import Decorator from './Decorator.js';
import TreeView from './views/TreeView.js';
/** @import Composite from '../Composite.js'; */

class Tree extends Decorator {

  name = 'Tree';

  /**
   * @constructor
   * @param {Composite} element
   */
  constructor(element) {
    super(new TreeView(element.getView()), element);
    const treeList = new TreeList();
    treeList.setChildren(element.getChildren());
    this.setStaticChild('treeList', treeList);
    // TODO : transformation d'un noeud en feuille et inversement
  }

  /**
   * @override
   * @returns {TreeView}
   */
  getView() {
    return super.getView();
  }

  setOpen() {
    this.getView()
      .setOpen();
  }

}

export default Tree;