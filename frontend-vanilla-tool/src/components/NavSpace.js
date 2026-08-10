import Component from './Component.js';
import NavTree from './NavTree.js';
import NavSpaceView from './views/NavSpaceView.js';

class NavSpace extends Component {

  name = 'NavSpace';
  constructor() {
    super(new NavSpaceView());

    this.setStaticChild('navTree', new NavTree());
  }

}

export default NavSpace;