import ActionView from './ActionView.js';

class ActionButtonView extends ActionView {

  name = 'ActionButtonView';

  /**
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   * @param {string} data.role - Rôle du bouton
   * @param {icon|menu|label} data.type - Type de bouton
   */
  constructor(data) {
    super(data);
  }
  /**
   * @override {@link View.getHtmlView}
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   * @param {string} data.role - Rôle du bouton
   * @param {icon|menu|label} data.type - Type de bouton
   * @returns {string} - Code HTML du bouton
   */
  getHtmlView(data) {
    return String.raw`<button id="${ data.id }" class="clickable ${ data.type }-button action__button" role="${ data.role }">
      <span>${ data.label }</span></button>`;
  }

}
export default ActionButtonView;