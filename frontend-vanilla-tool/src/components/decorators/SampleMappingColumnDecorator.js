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
  }

  getRuleItem() {
    return this.#ruleItem;
  }

  getSampleItems() {
    return this.#sampleItems;
  }

  /** @override */
  added(parent) {
    super.added(parent);

    this.#sampleItems.added(parent);
  }

  /** @override */
  removed() {
    this.#sampleItems.removed();

    super.removed();
  }

  /** @override */
  destroy() {
    this.#ruleItem = null;
    this.#sampleItems = null;

    super.destroy();
  }

}

export default SampleMappingColumnDecorator;