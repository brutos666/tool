import Component from './Component.js';
import ItemsKeyboardNavDecorator from './decorators/ItemsKeyboardNavDecorator.js';
import NavTree from './NavTree.js';
import NavSpaceView from './views/NavSpaceView.js';

class NavSpace extends Component {

  name = 'NavSpace';
  constructor() {
    super(new NavSpaceView());

    const navTree = new NavTree();
    this.setStaticChild('navTree', new ItemsKeyboardNavDecorator(navTree));
  }

}

export default NavSpace;