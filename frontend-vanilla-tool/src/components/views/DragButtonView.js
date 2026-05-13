import View from './View.js';

class DragButtonView extends View {

  name = 'DragButtonView';

  #doActionCallback = () => {};

  constructor() {
    super();

    this.getElementView()
      .addEventListener('keydown', () => {
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
    this.addEventListener('mousedown', () => {
      dragElementView.getElementView()
        .setAttribute('draggable', 'true');
    });
    this.addEventListener('mousemove', () => {
      document.activeElement.blur();
    });

    this.addEventListener('mouseup', () => {
      dragElementView.getElementView()
        .setAttribute('draggable', 'false');
    });
  }

  /**
   * @override {@link View.getHtmlView}
   */
  getHtmlView() {
    return String.raw`<button class="draggable drag-button" role="button" tabindex="-1">
      <span class="button__icon">
        <svg viewBox="0 0 16 10" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <circle cx="3" cy="3" r="1"/>
          <circle cx="8" cy="3" r="1"/>
          <circle cx="13" cy="3" r="1"/>
          <circle cx="3" cy="8" r="1"/>
          <circle cx="8" cy="8" r="1"/>
          <circle cx="13" cy="8" r="1"/>
        </svg></span>
      <span class="button__label">Déplacer</span></button>`;
  }

}

export default DragButtonView;