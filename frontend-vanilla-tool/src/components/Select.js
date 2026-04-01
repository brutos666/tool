import Component from './Component.js';
import SelectView from './views/SelectView.js';

class Select extends Component {

  /**
   * @constructor
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du select
   * @param {string} data.emptyLabel - Libellé quand rien n'est sélectionner
   * @param {Array<Option>} data.options - Liste des options du select
   */
  constructor(data) {
    super(new SelectView(data));
  }
  /**
   * @override
   * @returns {SelectView}
   */
  getView() {
    return super.getView();
  }
  setDoSelectCallback(callback) {
    this.getView()
      .setDoSelectCallback(callback);
  }

}

export default Select;