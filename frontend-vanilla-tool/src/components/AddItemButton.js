import Action from './Action.js';
import AddItemButtonView from './views/AddItemButtonView.js';

class AddItemButton extends Action {

  name = 'AddItemButton';
  static EVENTS = { focus: 'itemLikeButtonFocus' };

  /**
   * @constructor de la classe Button
   * @param {object} data - Informations pour afficher le bouton
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   */
  constructor(data) {
    super(new AddItemButtonView(data));
    this.getView()
      .setOnFocusCallback(() => {
        this.getView()
          .dispatchEvent(new CustomEvent(AddItemButton.EVENTS.focus, { bubbles: true, detail: this }));
      });
  }

}

export default AddItemButton;