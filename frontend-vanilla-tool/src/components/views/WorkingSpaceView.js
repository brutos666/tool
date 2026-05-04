import View from './View.js';

class WorkingSpaceView extends View {

  #onCurrentCallback = () => {};
  #currentSpaceId = null;

  constructor() {
    super();

    this.activateSplitter();
  }

  setStaticView(id, view) {
    super.setStaticView(id, view);
    if (!(id === 'main' || id === 'nav')) {
      return;
    }
    view.getElementView()
      .addEventListener('focusin', this.setCurrentSpace.bind(this, id));
    view.getElementView()
      .addEventListener('mousedown', this.setCurrentSpace.bind(this, id));
    view.getElementView()
      .addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          this.setCurrentSpace(id === 'main' ? 'nav' : 'main');
        }
      });
    if (id === 'nav') {
      this.setCurrentSpace('nav');
    }
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

  setCurrentSpace(id) {
    if (this.#currentSpaceId === id) {
      return;
    }
    if (this.#currentSpaceId) {
      this.getStaticView(this.#currentSpaceId)
        .getElementView()
        .setAttribute('tabindex', '-1');
    }
    this.#currentSpaceId = id;
    const elementView = this.getStaticView(id)
      .getElementView();
    elementView.setAttribute('tabindex', '0');
    elementView.focus();
    this.#onCurrentCallback(id);
  }

}

export default WorkingSpaceView;