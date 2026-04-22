import LoadItems from '../../commands/LoadItems.js';
import StoreData from '../../data/StoreData.js';
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
    if (itemInfosList.length === 0) {
      itemInfosList.push({ id: undefined, title: 'Nouvel espace', text: '', state: 'TODO', parentId: undefined, children: [] });
    }
    StoreData.storeItems(itemInfosList);
  }

  loadItems() {
    new LoadItems(this)
      .execute();
  }

}

export default CommandLoadDecorator;