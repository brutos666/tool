import View from './View.js';

class SampleMappingTablesView extends View {

  name = 'SampleMappingTablesView';

  /** @type {Array<HTMLTableCellElement>} */
  #ruleHeaders = [];

  /** @type {Array<HTMLTableCellElement>} */
  #sampleCells = [];

  /** @type {HTMLTableElement} */
  #sampleTable = null;

  #zoom = 1;

  constructor(data) {
    super(data);
    this.#sampleTable = this.getElementView()
      .querySelector('.sample-mapping__table');
  }

  addColumn(ruleView, samplesView) {
    const ruleNode = document.createElement('th');
    ruleNode.classList.add('sample-mapping__rule');
    ruleNode.appendChild(ruleView.getElementView());

    const samplesNode = document.createElement('td');
    samplesNode.classList.add('sample-mapping__samples');
    samplesNode.appendChild(samplesView.getElementView());

    this.#ruleHeaders.push(ruleNode);
    this.#sampleCells.push(samplesNode);

    const rulesSpace = this.getElementView()
      .querySelector('#spaceRules');
    const ruleSpacer = rulesSpace.querySelector('.sample-mapping__add-rule');
    rulesSpace.insertBefore(ruleNode, ruleSpacer);

    const samplesSpace = this.getElementView()
      .querySelector('#spaceSamples');
    const sampleSpacer = samplesSpace.querySelector('.sample-mapping__samples-empty');
    samplesSpace.insertBefore(samplesNode, sampleSpacer);

    this.getElementView()
      .querySelector('.sample-mapping__story-item').colSpan = this.#ruleHeaders.length + 1;
  }

  removeAllColumns() {
    this.#ruleHeaders.forEach(ruleNode => ruleNode.parentNode.removeChild(ruleNode));
    this.#sampleCells.forEach(samplesNode => samplesNode.parentNode.removeChild(samplesNode));
    this.#ruleHeaders = [];
    this.#sampleCells = [];
    this.getElementView()
      .querySelector('.sample-mapping__story-item').colSpan = 1;
  }

  removeColumn(index) {
    const ruleNode = this.#ruleHeaders[index];
    const samplesNode = this.#sampleCells[index];

    ruleNode.parentNode.removeChild(ruleNode);
    samplesNode.parentNode.removeChild(samplesNode);

    this.#ruleHeaders.splice(index, 1);
    this.#sampleCells.splice(index, 1);

    this.getElementView()
      .querySelector('.sample-mapping__story-item').colSpan = this.#ruleHeaders.length + 1;
  }

  getHtmlView() {
    return String.raw`<div class ="sample-mapping"><template id="toolbar" class="sample-mapping__toolbar"></template>
      <table class="sample-mapping__table"><thead>
      <tr>
        <th class="sample-mapping__story-item" colspan="1" ><template id="storyItem"></template></th>
        <th class="sample-mapping__spacer"></th>
        <th class="sample-mapping__story-type"><span class="sample-mapping--type">Story</span></th>
      </tr>
      <tr id="spaceRules">
        <th class="sample-mapping__add-rule sample-mapping__rule "><template id="addItemAction"></template></th>
        <th class="sample-mapping__spacer"></th>
        <th class="sample-mapping__rules-type"><span class="sample-mapping--type">Rules</span></th>
      </tr></thead>
      <tbody><tr id="spaceSamples">
        <td class="sample-mapping__samples-empty sample-mapping__samples"></td>
        <td class="sample-mapping__spacer"></td>
        <td class="sample-mapping__samples-type"><span class="sample-mapping--type">Samples / Questions</span></td>
      </tr></tbody></table></div>`;
  }

  zoomMinus() {
    resetResize(this.#sampleTable);
    this.#zoom -= 0.1;
    this.#sampleTable.style.setProperty('--zoom', this.#zoom);
    this.#sampleTable.classList.add('zoom');
  }

  zoomPlus() {
    resetResize(this.#sampleTable);
    this.#zoom += 0.1;
    this.#sampleTable.style.setProperty('--zoom', this.#zoom);
    this.#sampleTable.classList.add('zoom');
  }
  zoomReset() {
    resetResize(this.#sampleTable);
    this.#zoom = 1;
    this.#sampleTable.style.setProperty('--zoom', this.#zoom);
    this.#sampleTable.classList.remove('zoom');
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

export default SampleMappingTablesView;