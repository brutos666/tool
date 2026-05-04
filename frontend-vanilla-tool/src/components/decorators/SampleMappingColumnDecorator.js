import View from '../views/View.js';
import ItemDecorator from './ItemDecorator.js';

class SampleMappingColumnDecorator extends ItemDecorator {

  name = 'SampleMappingColumn';

  /** @type {SampleMappingSamples} */
  #sampleItems;

  constructor(decoratedElement, sampleItems) {
    super(new View(), decoratedElement);
    this.#sampleItems = sampleItems;
    sampleItems.added(this);
  }

  getSampleItems() {
    return this.#sampleItems;
  }

}

export default SampleMappingColumnDecorator;