import ExportItems from '../../commands/ExportItems.js';
import ImportItems from '../../commands/ImportItems.js';
import CommandDecorator from './CommandDecorator.js';
import CommandDecoratorView from './views/CommandDecoratorView.js';
/** @import ActionButton from '../ActionButton.js'; */
/** @import {ItemInfos} from '../../data/TreeItem.js' */

class CommandActionDecorator extends CommandDecorator {

  /**
   * @constructor
   * @param {ActionButton} actionButton - Element décoré
   */
  constructor(actionButton) {
    super(new CommandDecoratorView(actionButton.getView()), actionButton);
  }

  exportItems() {
    new ExportItems(this)
      .execute();
  }

  importItems(fileUpload) {
    new ImportItems(this, fileUpload)
      .execute();
  }

}

export default CommandActionDecorator;