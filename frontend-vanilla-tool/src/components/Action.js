import Component from './Component.js';

class Action extends Component {

  constructor(view) {
    super(view);
  }
  setDoActionCallback(callback) {
    this.getView()
      .setDoActionCallback(callback);
  }

}

export default Action;