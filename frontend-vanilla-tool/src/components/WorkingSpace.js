import NavTree from './NavTree.js';
import WorkingSpaceView from './views/WorkingSpaceView.js';
import Tree from './decorators/Tree.js';
import Component from './Component.js';
import MainSpace from './MainSpace.js';

class WorkingSpace extends Component {

  #navTree;

  constructor() {
    super(new WorkingSpaceView());

    this.#navTree = new NavTree();
    const mainSpace = new MainSpace();
    this.setStaticChild('nav', this.#navTree);
    this.setStaticChild('main', mainSpace);

    this.#navTree.getView()
      .addEventListener(Tree.EVENTS.focus, event => {
        mainSpace.setTreeItem(event.detail);
      });
  }

}

export default WorkingSpace;