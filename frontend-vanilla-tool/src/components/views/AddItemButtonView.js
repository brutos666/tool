import { ITEM_LAYOUT } from '../../tools/Constants.js';
import ActionView from './ActionView.js';

class AddItemButtonView extends ActionView {

  name = 'AddItemButtonView';

  /**
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   * @param {LAYOUT} data.layout - Type de bouton
   */
  constructor(data) {
    super(data);
  }

  /**
   * @override {@link View.getHtmlView}
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   * @param {LAYOUT} data.layout - Type de bouton
   * @returns {string} - Code HTML du bouton
   */
  getHtmlView(data) {
    return String.raw`<button id="${ data.id }" class="clickable item-like-button ${ getClassForViewChoice(data.layout) }" role="button">
      <span>${ data.label }</span></button>`;
  }

}
/**
 * Retourne la classe CSS correspondant à la vue demandée
 * @param {ITEM_LAYOUT} layout - Vue demandée
 * @returns {string} - Classe CSS correspondante
 */
function getClassForViewChoice(layout) {
  if (ITEM_LAYOUT.isPostIt(layout)) {
    return 'add-item--post-it';
  }
  switch (layout) {
    case ITEM_LAYOUT.Todo:
      return 'add-item--todo';
    case ITEM_LAYOUT.Title:
      return 'add-item--title';
    default:
      return 'add-item--block';
  }
}
export default AddItemButtonView;