import View from './View.js';

class SampleMappingGridView extends View {

  name = 'SampleMappingGridView';

  /** @type {Array<HTMLTableCellElement>} */
  #ruleHeaders = [];

  /** @type {Array<HTMLTableCellElement>} */
  #sampleCells = [];

  /** @type {HTMLElement} */
  #sampleGrid = null;
  #addRuleSpace = null;
  #sampleEmptySpace = null;

  #zoom = 1;

  constructor(data) {
    super(data);
    this.#sampleGrid = this.getElementView()
      .querySelector('.sample-mapping-grid__grid');
    this.#addRuleSpace = this.#sampleGrid.querySelector('.sample-mapping__add-rule');
    this.#sampleEmptySpace = this.#sampleGrid.querySelector('.sample-mapping__samples-empty');
  }

  addColumn(ruleView, samplesView) {
    this.#ruleHeaders.push(ruleView.getElementView());
    this.#sampleCells.push(samplesView.getElementView());

    this.#addRuleSpace.parentNode.insertBefore(ruleView.getElementView(), this.#addRuleSpace);
    this.#sampleEmptySpace.parentNode.insertBefore(samplesView.getElementView(), this.#sampleEmptySpace);

    this.#sampleGrid.style.setProperty('--number-of-columns', this.#ruleHeaders.length + 1);
  }

  removeAllColumns() {
    this.#ruleHeaders.forEach(ruleNode => ruleNode.parentNode.removeChild(ruleNode));
    this.#sampleCells.forEach(samplesNode => samplesNode.parentNode.removeChild(samplesNode));
    this.#ruleHeaders = [];
    this.#sampleCells = [];
    this.#sampleGrid.style.setProperty('--number-of-columns', 1);
  }

  removeColumn(index) {
    const ruleNode = this.#ruleHeaders[index];
    const samplesNode = this.#sampleCells[index];

    ruleNode.parentNode.removeChild(ruleNode);
    samplesNode.parentNode.removeChild(samplesNode);

    this.#ruleHeaders.splice(index, 1);
    this.#sampleCells.splice(index, 1);

    this.#sampleGrid.style.setProperty('--number-of-columns', this.#ruleHeaders.length + 1);
  }

  getHtmlView() {
    return String.raw`<div class ="sample-mapping-grid"><template id="toolbar" class="sample-mapping-grid__toolbar"></template>
      <div class="sample-mapping-grid__grid">
        <div class="sample-mapping-grid__row sample-mapping-grid__story">
          <div class="sample-mapping-grid__title"><template id="storyItem"></template></div>
          <div class="sample-mapping__story-type"><span class="sample-mapping--type">Story</span></div>
        </div>
        <div class="sample-mapping-grid__row sample-mapping-grid__rules">
          <div class="sample-mapping__add-rule"><template id="addItemAction"></template></div>
          <div class="sample-mapping__rules-type"><span class="sample-mapping--type">Rules</span></div>
        </div>
        <div class="sample-mapping-grid__row sample-mapping-grid__samples">
          <div class="sample-mapping__samples-empty"></div>
          <div class="sample-mapping__samples-type"><span class="sample-mapping--type">Samples / Questions</span></div>
        </div>
      </div>`;
  }

  zoomMinus() {
    resetResize(this.#sampleGrid);
    this.#zoom -= 0.1;
    this.#sampleGrid.style.setProperty('--zoom', this.#zoom);
    this.#sampleGrid.classList.add('zoom');
  }

  zoomPlus() {
    resetResize(this.#sampleGrid);
    this.#zoom += 0.1;
    this.#sampleGrid.style.setProperty('--zoom', this.#zoom);
    this.#sampleGrid.classList.add('zoom');
  }
  zoomReset() {
    resetResize(this.#sampleGrid);
    this.#zoom = 1;
    this.#sampleGrid.style.setProperty('--zoom', this.#zoom);
    this.#sampleGrid.classList.remove('zoom');
  }

}
/**
 * Annuler le redimensionnement éventuel des items
 *
 * @param {HTMLElement} element
 */
function resetResize(element) {
  const items = element.querySelectorAll('.item__article');
  items.forEach(item => {
    item.style.removeProperty('width');
    item.style.removeProperty('height');
  });
}
export default SampleMappingGridView;