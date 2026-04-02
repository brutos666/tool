import Composite from './Composite.js';
import CheckList from './CheckList.js';
import NavTree from './NavTree.js';
import WorkingSpaceView from './views/WorkingSpaceView.js';

class WorkingSpace extends Composite {

  #navTree;
  #checkList;

  constructor() {
    super(new WorkingSpaceView());

    this.#navTree = new NavTree();
    this.#checkList = new CheckList();
    this.setStaticChild('nav', this.#navTree);
    this.setStaticChild('main', this.#checkList);
  }
  /**
   * @override
   * @returns {WorkingSpaceView}
   */
  getView() {
    return super.getView();
  }

}

export default WorkingSpace;