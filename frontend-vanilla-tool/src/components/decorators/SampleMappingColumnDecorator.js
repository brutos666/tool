import View from '../views/View.js';
import ItemDecorator from './ItemDecorator.js';

class SampleMappingColumnDecorator extends ItemDecorator {

  name = 'SampleMappingColumnDecorator';

  /** @type {Item} */
  #ruleItem;
  /** @type {SampleMappingSamples} */
  #sampleItems;

  constructor(decoratedElement, sampleItems) {
    super(new View(), decoratedElement);
    this.#ruleItem = decoratedElement;
    this.#sampleItems = sampleItems;
    sampleItems.added(this);
  }

  getRuleItem() {
    return this.#ruleItem;
  }

  getSampleItems() {
    return this.#sampleItems;
  }

  removed() {
    super.removed();
    this.#ruleItem.removed();
    this.#sampleItems.removed();
  }

}

export default SampleMappingColumnDecorator;