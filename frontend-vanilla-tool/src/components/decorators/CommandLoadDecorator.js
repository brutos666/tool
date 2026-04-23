import LoadItems from '../../commands/LoadItems.js';
import CommandSpaceDecorator from './CommandSpaceDecorator.js';
import CommandDecoratorView from './views/CommandDecoratorView.js';
/** @import TreeList from '../TreeList.js'; */
/** @import {ItemInfos} from '../../data/TreeItem.js'; */

class CommandLoadDecorator extends CommandSpaceDecorator {

  name = 'CommandLoadDecorator';

  /**
   * @constructor
   * @param {TreeList} items - Element décoré
   */
  constructor(items) {
    super(new CommandDecoratorView(items.getView()), items);
  }

  /**
   * @override
   * @returns {WorkingSpace}
   */
  getDecoratedElement() {
    return super.getDecoratedElement();
  }

  loadItems() {
    new LoadItems(this)
      .execute();
  }

}

export default CommandLoadDecorator;