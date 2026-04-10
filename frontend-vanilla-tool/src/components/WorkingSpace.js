import Composite from './Composite.js';
import CheckList from './CheckList.js';
import NavTree from './NavTree.js';
import WorkingSpaceView from './views/WorkingSpaceView.js';
import Toolbar from './Toolbar.js';
import Tree from './decorators/Tree.js';

class WorkingSpace extends Composite {

  #navTree;
  #checkList;

  constructor() {
    super(new WorkingSpaceView());

    this.#navTree = new NavTree();
    this.#checkList = new CheckList();
    this.setStaticChild('nav', this.#navTree);
    this.setStaticChild('main', this.#checkList);

    this.#navTree.getView()
      .addEventListener(Tree.EVENTS.focus, event => {
        this.#checkList.setTreeItem(event.detail);
      });
  }

}

export default WorkingSpace;