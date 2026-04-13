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
    return String.raw`<div class ="sample-mapping"><table class="sample-mapping__table"><thead>
      <tr>
        <th class="sample-mapping__story-item" colspan="1" ><template id="storyItem"></template></th>
        <th class="spacer"></th>
        <th class="sample-mapping__story-type"><span class="sample-mapping--type">Story</span></th>
      </tr>
      <tr id="spaceRules">
        <th class="sample-mapping__add-rule sample-mapping__rule"><template id="addRule"></template></th>
        <th class="spacer"></th>
        <th class="sample-mapping__rules-type"><span class="sample-mapping--type">Rules</span></th>
      </tr></thead>
      <tbody><tr id="spaceSamples">
        <td class="sample-mapping__samples-empty sample-mapping__samples"></td>
        <td class="spacer"></td>
        <td class="sample-mapping__samples-type"><span class="sample-mapping--type">Samples / Questions</span></td>
      </tr></tbody></table></div>`;
  }

}

export default SampleMappingTablesView;