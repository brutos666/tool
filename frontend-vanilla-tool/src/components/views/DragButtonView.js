import SvgUtilities from '../../tools/SvgUtilities.js';
import View from './View.js';

class DragButtonView extends View {

  name = 'DragButtonView';

  #doActionCallback = () => {};
  #onMouseUpEvent = this.onMouseUp.bind(this);
  #onKeyDownEvent = this.onKeyDown.bind(this);
  #focusBefore = null;
  #dragElement = null;

  /**
   * @constructor. Crée la vue à partir des données passées en paramètre
   * @param {'move'|'reorder'} icon - Icône
   */
  constructor(icon) {
    super(icon);

    this.getElementView()
      .addEventListener('keydown', this.#onKeyDownEvent);
  }

  onKeyDown(event) {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.#doActionCallback();
  }

  setDoActionCallback(callback) {
    this.#doActionCallback = callback;
  }

  getDoActionCallback() {
    return this.#doActionCallback;
  }

  setDragElementView(dragElementView) {
    this.#dragElement = dragElementView.getElementView();

    this.addEventListener('mousedown', () => {
      this.#focusBefore = document.activeElement;
      this.#dragElement.setAttribute('draggable', 'true');
      document.addEventListener('mouseup', this.#onMouseUpEvent);
      this.#dragElement.addEventListener('dragend', this.#onMouseUpEvent);
    });
  }
  onMouseUp() {
    if (document.activeElement === this.getElementView()) {
      this.#focusBefore.focus();
    }
    this.#dragElement.setAttribute('draggable', 'false');
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

  destroy() {
    this.getElementView()
      .removeEventListener('keydown', this.#onKeyDownEvent);
    this.#dragElement.removeEventListener('dragend', this.#onMouseUpEvent);
    document.removeEventListener('mouseup', this.#onMouseUpEvent);

    super.destroy();

    this.#doActionCallback = null;
    this.#dragElement = null;
    this.#focusBefore = null;
    this.#onKeyDownEvent = null;
    this.#onMouseUpEvent = null;
  }

}

export default DragButtonView;