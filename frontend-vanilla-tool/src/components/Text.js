import Component from './Component.js';
import TextView from './views/TextView.js';

class Text extends Component {

  /**
   * @constructor
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.text - Texte à afficher
   */
  constructor(data) {
    super(new TextView(data));
  }

}

export default Text;