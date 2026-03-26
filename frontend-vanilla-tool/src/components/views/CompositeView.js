import View from './View.js';

class CompositeView extends View {

  #spaceChildren;

  constructor() {
    super();
  }

  createView(htmlText) {
    super.createView(htmlText);
    const spaceChildren = this.getNodeView()
      .querySelector('[id=\'spaceChildren\']');

    if (spaceChildren) {
      this.#spaceChildren = spaceChildren;
    } else {
      this.#spaceChildren = this.getNodeView();
      this.#spaceChildren.setAttribute('id', 'spaceChildren');
    }
  }
  getSpaceChildren() {
    return this.#spaceChildren;
  }

  /**
   * Ajoute un enfant. La vue du composant est ajouté au DOM dans l'espace dédié (#spaceChildren)
   * @param {View} view : vue
   */
  addView(view) {
    // Ajout au DOM
    this.#spaceChildren.appendChild(view.getNodeView());
  }

  /**
   * ReplaceView : remplace une vue par une autre dans le DOM
   * @param {View} viewToAdd - La vue à ajouter
   * @param {View} viewToRemove - La vue à supprimer
   */
  replaceView(viewToAdd, viewToRemove) {
    this.#spaceChildren.replaceChild(viewToAdd.getNodeView(), viewToRemove.getNodeView());
  }

  removeView(view) {
    this.#spaceChildren.removeChild(view.getNodeView());
  }

  removeAllViews() {
    this.#spaceChildren.innerHTML = '';
  }

}

export default CompositeView;