import View from './View.js';

class WorkingSpaceView extends View {

  constructor() {
    super();

    this.activateSplitter();
  }

  getHtmlView() {
    return String.raw`<div id="workingSpace" class="working-space">
    <nav id="navSpace" class="working-space__nav"><template id="nav"></template></nav>
    <div id="splitter" class="working-space__splitter">&nbsp;</div>
    <main id="mainSpace"class="working-space__main"><template id="main"></template></main>
  </div>`;
  }

  activateSplitter() {
    const workingSpace = this.getElementView();
    const navSpace = this.getElementView()
      .querySelector('#navSpace');
    const splitter = this.getElementView()
      .querySelector('#splitter');

    const moveSplitter = event => {
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

}

export default WorkingSpaceView;