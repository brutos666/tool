import View from './View.js';

class SampleMappingTablesView extends View {

  name = 'SampleMappingTablesView';

  /** @type {Array<HTMLTableCellElement>} */
  #ruleHeaders = [];

  /** @type {Array<HTMLTableCellElement>} */
  #sampleCells = [];

  /** @type {HTMLTableElement} */
  #sampleTable = null;
  /** @type {HTMLTableRowElement} */
  #storySpace = null;

  #addRuleSpace = null;
  #sampleEmptySpace = null;

  #zoom = 1;

  constructor(data) {
    super(data);
    this.#sampleTable = this.getElementView()
      .querySelector('.sample-mapping__table');
    this.#storySpace = this.#sampleTable.querySelector('.sample-mapping__story-item');
    this.#addRuleSpace = this.#sampleTable.querySelector('.sample-mapping__add-rule');
    this.#sampleEmptySpace = this.#sampleTable.querySelector('.sample-mapping__samples-empty');
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

    this.#addRuleSpace.parentNode.insertBefore(ruleNode, this.#addRuleSpace);
    this.#sampleEmptySpace.parentNode.insertBefore(samplesNode, this.#sampleEmptySpace);

    this.#storySpace.colSpan = this.#ruleHeaders.length + 1;
    this.#sampleTable.style.setProperty('--number-of-columns', this.#ruleHeaders.length + 1);
  }

  removeAllColumns() {
    this.#ruleHeaders.forEach(ruleNode => ruleNode.parentNode.removeChild(ruleNode));
    this.#sampleCells.forEach(samplesNode => samplesNode.parentNode.removeChild(samplesNode));
    this.#ruleHeaders = [];
    this.#sampleCells = [];

    this.#storySpace.colSpan = 1;
    this.#sampleTable.style.setProperty('--number-of-columns', 1);
    this.zoomReset();
  }

  removeColumn(index) {
    const ruleNode = this.#ruleHeaders[index];
    const samplesNode = this.#sampleCells[index];

    ruleNode.parentNode.removeChild(ruleNode);
    samplesNode.parentNode.removeChild(samplesNode);

    this.#ruleHeaders.splice(index, 1);
    this.#sampleCells.splice(index, 1);

    this.#storySpace.colSpan = this.#ruleHeaders.length + 1;
    this.#sampleTable.style.setProperty('--number-of-columns', this.#ruleHeaders.length + 1);
  }

  getHtmlView() {
    return String.raw`<div class ="sample-mapping"><template id="toolbar" class="sample-mapping__toolbar"></template>
      <table class="sample-mapping__table items-navigation__space" role="table"><thead>
      <tr class="sample-mapping__row">
        <th class="sample-mapping__story-item" colspan="1" ><template id="storyItem"></template></th>
        <th class="sample-mapping__spacer"></th>
        <th class="sample-mapping__story-type"><span class="sample-mapping--type">Story</span></th>
      </tr>
      <tr id="spaceRules" class="sample-mapping__row">
        <th class="sample-mapping__add-rule sample-mapping__rule"><template id="addItemAction"></template></th>
        <th class="sample-mapping__spacer"></th>
        <th class="sample-mapping__rules-type"><span class="sample-mapping--type">Rules</span></th>
      </tr></thead>
      <tbody><tr id="spaceSamples" class="sample-mapping__row">
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

  magnifyFocused() {
    this.#sampleTable.classList.toggle('current--magnify');
  }

}
/**
 * Annuler le redimensionnement éventuel des items
 *
 * @param {HTMLElement} element
 */
function resetResize(element) {
  const items = element.querySelectorAll('.item');
  items.forEach(item => {
    item.style.removeProperty('width');
    item.style.removeProperty('height');
  });
}

export default SampleMappingTablesView;