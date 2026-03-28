import View from './View.js';
import { createNode } from '../../tools/NodeUtilities.js';

class CompositeView extends View {

  /** @type {Element} */
  #spaceChildren;

  constructor(data) {
    super(data);
    const spaceChildren = determinateSpaceChildren(this.getNodeView());
    this.#spaceChildren = spaceChildren;
  }

  /**
   * @override {@link View.refreshView}
   * @param {Object} data - Données à utiliser pour redessiner la vue
   */
  refreshView(data) {
    const nodeElement = createNode(this.getHtmlView(data));
    const spaceChildren = determinateSpaceChildren(nodeElement);
    if (nodeElement === spaceChildren) {
      return;
    }
    const oldSpaceChildren = this.#spaceChildren;
    // Conserver l'espace dédié aux enfants
    spaceChildren.replaceWith(oldSpaceChildren);
    this.getElementView().parentNode.replaceChild(nodeElement, this.getElementView());
    this.setElementView(nodeElement);
  }

  /**
   * Redessine le composant pour afficher les vues des enfants
   * @param {Array<View>} childrenViews - Vues des enfants
   */
  refreshViews(childrenViews) {
    this.removeAllViews();
    for (const view of childrenViews) {
      this.addView(view);
    }
  }

  /**
   * Ajoute un enfant. La vue du composant est ajouté au DOM dans l'espace dédié (#spaceChildren)
   * @param {View} view : vue
   */
  addView(view) {
    // Ajout au DOM
    this.#spaceChildren.appendChild(view.getNodeView());
  }

  removeView(view) {
    this.#spaceChildren.removeChild(view.getNodeView());
  }

  removeAllViews() {
    this.#spaceChildren.innerHTML = '';
  }

}
/**
 * Détermine et retourne l'espace contenant les enfants
 * @param {Element} nodeView
 * @returns {Element}
 */
function determinateSpaceChildren(nodeView) {
  const spaceChildren = nodeView
    .querySelector('[id=\'spaceChildren\']');

  if (spaceChildren) {
    return spaceChildren;
  }
  nodeView.setAttribute('id', 'spaceChildren');
  return nodeView;
}

export default CompositeView;