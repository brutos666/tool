import View from './View.js';

class TextView extends View {

  /**
   * @constructor
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.text - Texte à afficher
   */
  constructor(data) {
    super(data);
  }
  /**
   * @override {@link View.getHtmlView}
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.text - Texte à afficher
   */
  getHtmlView(data) {
    return String.raw`<div>${ data.text }</div>`;
  }

}

export default TextView;