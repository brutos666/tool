import View from './View.js';

class SampleMappingView extends View {

  name = 'SampleMappingView';

  /** @type {Array<View>} */
  #ruleHeaders = [];

  /** @type {Array<View>} */
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
    this.#sampleTable = this.getElementView();
    this.#storySpace = this.#sampleTable.querySelector('.sample-mapping__story-item');
    this.#addRuleSpace = this.#sampleTable.querySelector('.sample-mapping__add-rule');
    this.#sampleEmptySpace = this.#sampleTable.querySelector('.sample-mapping__samples-empty');
  }

  addColumn(ruleView, samplesView) {
    this.addColumnAt(ruleView, samplesView, this.#ruleHeaders.length);
  }

  addColumnAt(ruleView, samplesView, index) {
    const ruleNode = document.createElement('th');
    ruleNode.classList.add('sample-mapping__rule');
    ruleNode.appendChild(ruleView.getElementView());

    const samplesNode = document.createElement('td');
    samplesNode.classList.add('sample-mapping__samples');
    samplesNode.appendChild(samplesView.getElementView());

    if (index === undefined || index >= this.#ruleHeaders.length) {
      this.#addRuleSpace.parentNode.insertBefore(ruleNode, this.#addRuleSpace);
      this.#sampleEmptySpace.parentNode.insertBefore(samplesNode, this.#sampleEmptySpace);
      this.#ruleHeaders.push(ruleView);
      this.#sampleCells.push(samplesView);
    } else {
      const indexRuleNode = this.#ruleHeaders[index].getElementView().parentNode;
      const indexSamplesNode = this.#sampleCells[index].getElementView().parentNode;
      indexRuleNode.parentNode.insertBefore(ruleNode, indexRuleNode);
      indexSamplesNode.parentNode.insertBefore(samplesNode, indexSamplesNode);
      this.#ruleHeaders.splice(index, 0, ruleView);
      this.#sampleCells.splice(index, 0, samplesView);
    }
    this.#storySpace.colSpan = this.#ruleHeaders.length + 1;
    this.#sampleTable.style.setProperty('--number-of-columns', this.#ruleHeaders.length + 1);
  }

  removeAllColumns() {
    this.#ruleHeaders.forEach(ruleView => {
      const ruleNode = ruleView.getElementView().parentNode;
      ruleNode.parentNode.removeChild(ruleNode);
      ruleView.removed();
    });
    this.#sampleCells.forEach(samplesView => {
      const samplesNode = samplesView.getElementView().parentNode;
      samplesNode.parentNode.removeChild(samplesNode);
      samplesView.removed();
    });
    this.#ruleHeaders = [];
    this.#sampleCells = [];

    this.#storySpace.colSpan = 1;
    this.#sampleTable.style.setProperty('--number-of-columns', 1);
    this.zoomReset();
  }

  removeColumn(index) {
    const ruleView = this.#ruleHeaders[index];
    const ruleNode = ruleView.getElementView().parentNode;
    ruleNode.parentNode.removeChild(ruleNode);
    ruleView.removed();
    const sampleView = this.#sampleCells[index];
    const samplesNode = sampleView.getElementView().parentNode;
    samplesNode.parentNode.removeChild(samplesNode);
    sampleView.removed();

    this.#ruleHeaders.splice(index, 1);
    this.#sampleCells.splice(index, 1);

    this.#storySpace.colSpan = this.#ruleHeaders.length + 1;
    this.#sampleTable.style.setProperty('--number-of-columns', this.#ruleHeaders.length + 1);
  }

  getHtmlView() {
    return String.raw`<table class="sample-mapping__table" role="table"><thead>
      <tr class="sample-mapping__row">
        <th class="sample-mapping__story-item" colspan="1" ><template id="storyItem"></template></th>
        <th class="sample-mapping__spacer"></th>
        <th class="sample-mapping__story-type"><span class="sample-mapping--type">Story</span></th>
      </tr>
      <tr id="spaceRules" class="sample-mapping__row" aria-orientation="horizontal">
        <th class="sample-mapping__add-rule sample-mapping__rule"><template id="addItemAction"></template></th>
        <th class="sample-mapping__spacer"></th>
        <th class="sample-mapping__rules-type"><span class="sample-mapping--type">Rules</span></th>
      </tr></thead>
      <tbody><tr id="spaceSamples" class="sample-mapping__row">
        <td class="sample-mapping__samples-empty sample-mapping__samples"></td>
        <td class="sample-mapping__spacer"></td>
        <td class="sample-mapping__samples-type"><span class="sample-mapping--type">Samples / Questions</span></td>
      </tr></tbody></table>`;
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

export default SampleMappingView;