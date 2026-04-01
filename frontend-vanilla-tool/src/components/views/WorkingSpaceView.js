import PlacedCompositeView from './PlacedCompositeView.js';
/** @import View from './View.js'; */
/**
 * Cette classe s'occupe de disposer les enfants de l'espace de travail par leur ordre d'ajout
 */
class WorkingSpaceView extends PlacedCompositeView {

  constructor() {
    super();

    this.activateSplitter();
  }

  /**
   * @override
   * Cette classe s'occupe de disposer les 2 enfants
   * @param {View} view
   */
  addView(view) {
    if (this.getView('workingTreeSpace') === undefined) {
      super.setView('workingTreeSpace', view);
    } else if (this.getView('workingPanelSpace') === undefined) {
      super.setView('workingPanelSpace', view);
    }
  }

  getHtmlView() {
    return String.raw`<div id="workingSpace" class="working__space">
    <aside id="workingTreeSpace" class="working-tree__space"></aside>
    <div id="splitter" class="vertical-splitter">&nbsp;</div>
    <main id="workingPanelSpace"class="working-panel__space"></main>
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