import View from './View.js';

class DragButtonView extends View {

  name = 'DragButtonView';
  constructor() {
    super();
  }

  /**
   * @override {@link View.getHtmlView}
   */
  getHtmlView() {
    return String.raw`<button class="draggable drag-button" role="button">
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