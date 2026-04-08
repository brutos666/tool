import LoadItems from '../../commands/LoadItems.js';
import CommandDecorator from './CommandDecorator.js';
import CommandDecoratorView from './views/CommandDecoratorView.js';
/** @import Items from '../Items.js'; */
/** @import {ItemInfos} from '../../data/TreeItem.js'; */

class CommandItemsDecorator extends CommandDecorator {

  name = 'CommandItemsDecorator';

  /**
   * @constructor
   * @param {Items} items
   */
  constructor(items) {
    super(new CommandDecoratorView(items.getView()), items);
  }

  /**
   * @override
   * @returns {Items}
   */
  getDecoratedElement() {
    return super.getDecoratedElement();
  }

  /**
   * @override
   * @param {string} name
   * @param {Array<ItemInfos>} itemInfosList
   */
  commandDone(name, itemInfosList) {
    super.commandDone(name, itemInfosList);
    if (name !== 'LoadItems') {
      return;
    }
    this.getDecoratedElement()
      .addItems(itemInfosList);
  }

  loadItems() {
    new LoadItems(this)
      .execute();
  }

}

export default CommandItemsDecorator;