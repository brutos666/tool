import SvgUtilities from '../../tools/SvgUtilities.js';
import View from './View.js';

class DragButtonView extends View {

  name = 'DragButtonView';

  #doActionCallback = () => {};
  #onMouseUpEvent = () => {};
  #focusBefore = null;

  /**
   * @constructor. Crée la vue à partir des données passées en paramètre
   * @param {'move'|'reorder'} icon - Icône
   */
  constructor(icon) {
    super(icon);

    this.getElementView()
      .addEventListener('keydown', event => {
        if (event.key !== 'Enter') {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.#doActionCallback();
      });
  }
  setDoActionCallback(callback) {
    this.#doActionCallback = callback;
  }

  getDoActionCallback() {
    return this.#doActionCallback;
  }

  setDragElementView(dragElementView) {
    this.#onMouseUpEvent = this.onMouseUp.bind(this, dragElementView);

    this.addEventListener('mousedown', () => {
      this.#focusBefore = document.activeElement;
      dragElementView.getElementView()
        .setAttribute('draggable', 'true');
      document.addEventListener('mouseup', this.#onMouseUpEvent);
      dragElementView.getElementView()
        .addEventListener('dragend', this.#onMouseUpEvent);
    });
  }
  onMouseUp(dragElementView) {
    if (document.activeElement === this.getElementView()) {
      this.#focusBefore.focus();
    }
    dragElementView.getElementView()
      .setAttribute('draggable', 'false');
    document.removeEventListener('mouseup', this.#onMouseUpEvent);
  }

  /**
   * @override {@link View.getHtmlView}
   * @param {'move'|'reorder'} icon - Icône
   */
  getHtmlView(icon) {
    return String.raw`<button class="draggable drag-button" role="button" tabindex="-1">
      <span class="button__icon">${ SvgUtilities.getIcon(icon) }</span>
      <span class="button__label">Déplacer</span></button>`;
  }

}

export default DragButtonView;