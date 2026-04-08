import Composite from './Composite.js';
import CheckList from './CheckList.js';
import NavTree from './NavTree.js';
import WorkingSpaceView from './views/WorkingSpaceView.js';
import Toolbar from './Toolbar.js';

class WorkingSpace extends Composite {

  #navTree;
  #checkList;

  constructor() {
    super(new WorkingSpaceView());

    const toolbar = new Toolbar();
    this.setStaticChild('toolbar', toolbar);
    this.#navTree = new NavTree();
    this.#checkList = new CheckList();
    this.setStaticChild('nav', this.#navTree);
    this.setStaticChild('main', this.#checkList);
  }

}

export default WorkingSpace;