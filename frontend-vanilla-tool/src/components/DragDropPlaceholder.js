import Component from './Component.js';
import DragDropPlaceholderView from './views/DragDropPlaceholderView.js';

class DragDropPlaceholder extends Component {

  name = 'DragDropPlaceholder';

  #position;
  #overId;

  /**
   * @constructor
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.overId - Identifiant
   * @param {'before'|'after'} data.position - position
   */
  constructor(data) {
    super(new DragDropPlaceholderView(data));
    this.#position = data.position;
    this.#overId = data.overId;
  }

  getPosition() {
    return this.#position;
  }

  getOverId() {
    return this.#overId;
  }

}
export default DragDropPlaceholder;