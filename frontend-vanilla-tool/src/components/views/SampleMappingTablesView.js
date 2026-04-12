import View from './View.js';

class SampleMappingTablesView extends View {

  name = 'SampleMappingTablesRulesView';

  /** @type {Array<HTMLTableCellElement>} */
  #ruleHeaders = [];

  /** @type {Array<HTMLTableCellElement>} */
  #sampleCells = [];

  constructor(data) {
    super(data);
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
    rulesSpace.appendChild(ruleNode);
    const samplesSpace = this.getElementView()
      .querySelector('#spaceSamples');
    samplesSpace.appendChild(samplesNode);

    document.querySelector('.sample-mapping__story-item').colSpan = this.#ruleHeaders.length;
  }

  removeAllColumns() {
    this.#ruleHeaders.forEach(ruleNode => ruleNode.parentNode.removeChild(ruleNode));
    this.#sampleCells.forEach(samplesNode => samplesNode.parentNode.removeChild(samplesNode));
    this.#ruleHeaders = [];
    this.#sampleCells = [];
    document.querySelector('.sample-mapping__story-item').colSpan = 1;
  }

  removeColumn(index) {
    const ruleNode = this.#ruleHeaders[index];
    const samplesNode = this.#sampleCells[index];

    ruleNode.parentNode.removeChild(ruleNode);
    samplesNode.parentNode.removeChild(samplesNode);

    this.#ruleHeaders.splice(index, 1);
    this.#sampleCells.splice(index, 1);

    document.querySelector('.sample-mapping__story-item').colSpan = this.#ruleHeaders.length;
  }

  getHtmlView() {
    return String.raw`<table><thead>
      <tr>
        <th class="sample-mapping__story-type"><span class="sample-mapping--type">Story</span></th>
        <th class="sample-mapping__story-item" colspan="1" ><template id="storyItem" ></template></th>
      </tr>
      <tr id="spaceRules">
        <th class="sample-mapping__rules-type"><span class="sample-mapping--type">Rules</span></th>
      </tr></thead>
      <tbody><tr id="spaceSamples">
        <td class="sample-mapping__samples-type"><span class="sample-mapping--type">Samples</span></td>
      </tr></tbody></table>`;
  }

}

export default SampleMappingTablesView;