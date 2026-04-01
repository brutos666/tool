import LoadItems from '../../commands/LoadItems.js';
import Item from '../Item.js';
import CommandDecorator from './CommandDecorator.js';
import CommandDecoratorView from './views/CommandDecoratorView.js';

class CommandItemsDecorator extends CommandDecorator {

  name = 'CommandItemsDecorator';

  /**
   * @constructor
   * @param {Component} element
   */
  constructor(element) {
    super(new CommandDecoratorView(element.getView()), element);
  }

  /**
   * @override
   */
  commandDone(name, itemInfosList) {
    super.commandDone(name, itemInfosList);
    if (name !== 'LoadItems') {
      return;
    }
    const targetElement = this.getTargetElement();
    targetElement.removeAllChildren();
    if (itemInfosList.length === 0) {
      targetElement.addNewItem();
      return;
    }
    const allItemsCards = itemInfosList.map(itemInfos => new Item({ itemInfos, viewChoice: targetElement.getLayout() }));
    targetElement.setChildren(allItemsCards);
  }

  loadItems() {
    new LoadItems(this)
      .execute();
  }

}

export default CommandItemsDecorator;