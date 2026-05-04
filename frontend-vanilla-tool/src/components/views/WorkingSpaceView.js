import View from './View.js';

class WorkingSpaceView extends View {

  #onCurrentCallback = () => {};
  #currentSpace = null;

  constructor() {
    super();

    this.activateSplitter();

    this.getElementView()
      .addEventListener('mousedown', this.setCurrentSpace.bind(this));
  }

  getHtmlView() {
    return String.raw`<div id="workingSpace" class="working-space">
    <template id="menu" class="working-space__menu"></template>
    <template id="nav" class="working-space__nav"></template>
    <div id="splitter" class="working-space__splitter">&nbsp;</div>
    <template id="main" class="working-space__main"></template>
  </div>`;
  }

  activateSplitter() {
    const workingSpace = this.getElementView();

    const splitter = this.getElementView()
      .querySelector('#splitter');

    const moveSplitter = event => {
      const navSpace = this.getElementView()
        .querySelector('.working-space__nav');
      const offset = workingSpace.getBoundingClientRect().left;
      navSpace.style.width = `${ event.clientX - offset }px`;
    };
    splitter.addEventListener('pointerdown', event => {
      event.preventDefault();
      splitter.setPointerCapture(event.pointerId);
      splitter.addEventListener('pointermove', moveSplitter);
      splitter.addEventListener('pointerup', () => {
        splitter.removeEventListener('pointermove', moveSplitter);
      }, { once: true });
    });
  }

  setOnCurrentCallback(onCurrentCallback) {
    this.#onCurrentCallback = onCurrentCallback;
  }
  setCurrentSpace(event) {
    const space = event.target.closest('.working-space__nav, .working-space__main');
    if (!space || this.#currentSpace && this.#currentSpace === space) {
      return;
    }
    this.#currentSpace = space;
    // Trouver l'identifiant de la vue statique correspondante
    if (this.getStaticView('main')
      .getElementView() === space) {
      this.#onCurrentCallback('main');
    } else {
      this.#onCurrentCallback('nav');
    }
  }

}

export default WorkingSpaceView;