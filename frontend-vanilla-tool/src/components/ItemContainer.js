'use strict';

import Composite from './Composite.js';
import ItemContainerView from './views/ItemContainerView.js';
/** @import { ItemInfos } from './Item.js' */

class ItemContainer extends Composite {

  constructor() {
    super(new ItemContainerView());
  }
  /**
   * @override
   * @returns {ItemContainerView}
   */
  getView() {
    return super.getView();
  }

}

export default ItemContainer;