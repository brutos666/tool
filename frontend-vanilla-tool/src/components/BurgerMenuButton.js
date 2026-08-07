import Component from './Component.js';
import BurgerMenuButtonView from './views/BurgerMenuButtonView.js';

class BurgerMenuButton extends Component {

  constructor(data) {
    super(new BurgerMenuButtonView(data));
  }

}
export default BurgerMenuButton;