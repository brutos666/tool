import Component from './Component.js';
import NavTree from './NavTree.js';
import NavSpaceView from './views/NavSpaceView.js';

class NavSpace extends Component {

  name = 'NavSpace';

  /** @type {NavTree} */
  #navTree;

  constructor() {
    super(new NavSpaceView());

    this.#navTree = new NavTree();
    this.setStaticChild('navTree', this.#navTree);
  }

  /** @override */
  giveFocus() {
    this.#navTree.giveFocus();
  }

}

export default NavSpace;