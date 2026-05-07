import { ITEM_LAYOUT } from '../../tools/Constants.js';
import ActionView from './ActionView.js';

class AddItemButtonView extends ActionView {

  name = 'AddItemButtonView';

  #onFocusCallback = () => {};

  /**
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   * @param {LAYOUT} data.layout - Type de bouton
   */
  constructor(data) {
    super({ id: data.id, label: data.label, role: 'button', type: 'item-like' });
    this.getElementView().classList.add('item-like-button');
    this.getElementView().classList.add(getClassForViewChoice(data.layout));

    // Ces boutons seront gérés via la navigation des items avec les flèches
    this.getElementView()
      .setAttribute('tabindex', '-1');

    this.getElementView()
      .addEventListener('focus', this.onFocus.bind(this), true);
  }
  setOnFocusCallback(onFocusCallback) {
    this.#onFocusCallback = onFocusCallback;
  }
  onFocus(event) {
    if (event.relatedTarget === null || (!this.getElementView()
      .contains(event.relatedTarget))) {
      this.#onFocusCallback();
    }
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