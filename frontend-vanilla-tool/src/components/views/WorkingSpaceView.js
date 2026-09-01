import View from './View.js';

class WorkingSpaceView extends View {

  #onPointerDownEvent = this.onPointerDown.bind(this);
  #onPointerMoveEvent = this.onPointerMove.bind(this);
  #onPointerUpEvent = this.onPointerUp.bind(this);

  #splitter;
  constructor() {
    super();
    this.#splitter = this.getElementView()
      .querySelector('#splitter');

    this.activateSplitter();
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
    this.#splitter.addEventListener('pointerdown', this.#onPointerDownEvent);
  }

  onPointerDown(event) {
    event.preventDefault();
    const splitter = this.#splitter;
    splitter.setPointerCapture(event.pointerId);
    splitter.addEventListener('pointermove', this.#onPointerMoveEvent);
    splitter.addEventListener('pointerup', this.#onPointerUpEvent, { once: true });
  }

  onPointerMove(event) {
    const workingSpace = this.getElementView();
    const navSpace = workingSpace.querySelector('.working-space__nav');
    const offset = workingSpace.getBoundingClientRect().left;
    navSpace.style.width = `${ event.clientX - offset }px`;
  }
  onPointerUp() {
    this.#splitter.removeEventListener('pointermove', this.#onPointerMoveEvent);
  }

  /** @override */
  destroy() {
    this.#splitter.removeEventListener('pointerdown', this.#onPointerDownEvent);
    this.#splitter.removeEventListener('pointermove', this.#onPointerMoveEvent);
    this.#splitter.removeEventListener('pointerup', this.#onPointerUpEvent, { once: true });

    super.destroy();
  }

}

export default WorkingSpaceView;