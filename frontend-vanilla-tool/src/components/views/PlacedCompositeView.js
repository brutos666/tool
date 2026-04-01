import CompositeView from './CompositeView.js';

/**
 * @typedef {Object} PlacedCompositeView
 * Cette classe permet de disposer certains éléments à des endroits fixes (id='<espace à définir>')
 * Elle permet également d'ajouter d'autres enfants dans un espace dédié (id='spaceChildren') so besoin
 */
class PlacedCompositeView extends CompositeView {

  #spaces = {};
  #nodeViews = {};

  constructor(data) {
    super(data);
  }

  /**
   * Ajoute un enfant. La vue du composant est ajouté au DOM dans l'espace donné par l'identifiant
   * @param {String} id : id de l'espace
   * @param {View} view : vue
   */
  setView(id, view) {
    if (this.#spaces[id]) {
      if (this.#nodeViews[id]) {
        this.#spaces[id].replaceChild(view.getNodeView(), this.#nodeViews[id]);
      } else {
        this.#spaces[id].appendChild(view.getNodeView());
      }
    } else {
      this.#spaces[id] = this.getNodeView()
        .querySelector(`#${ id }`);
      this.#spaces[id].appendChild(view.getNodeView());
    }
    this.#nodeViews[id] = view.getNodeView();
  }

  getView(id) {
    return this.#nodeViews[id];
  }

  /**
   * @override
   */
  getHtmlView(/* data */) {
    return '<div id="<espace à définir 1>"></div><div id="<espace à définir 2>"></div>';
  }

}

export default PlacedCompositeView;