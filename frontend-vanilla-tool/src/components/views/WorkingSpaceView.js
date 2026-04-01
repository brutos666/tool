import CompositeView from './CompositeView.js';

class WorkingSpaceView extends CompositeView {

  constructor() {
    super();

    this.activateSplitter();
  }

  getHtmlView() {
    return String.raw`<div id="workingSpace" class="working__space">
    <aside id="workingTreeSpace" class="working-tree__space"><template id="treeLayout"></template></aside>
    <div id="splitter" class="vertical-splitter">&nbsp;</div>
    <main id="workingPanelSpace"class="working-panel__space"><template id="panelLayout"></template></main>
  </div>`;
  }

  activateSplitter() {
    const workingSpace = this.getNodeView()
      .querySelector('#workingSpace');
    const workingTreeSpace = this.getNodeView()
      .querySelector('#workingTreeSpace');
    const splitter = this.getNodeView()
      .querySelector('#splitter');

    const moveSplitter = event => {
      const offset = workingSpace.getBoundingClientRect().left;
      workingTreeSpace.style.width = `${ event.clientX - offset }px`;
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