import Component from './Component.js';
import DragButtonView from './views/DragButtonView.js';

class DragButton extends Component {

  name = 'DragButton';
  constructor() {
    super(new DragButtonView());
  }

}

export default DragButton;