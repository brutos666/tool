import Command from './Command.js';
import FileCallsRequest from '../requests/FileCallsRequest.js';
/** @import CommandDecorator from '../components/decorators/CommandDecorator.js' */

class ExportItems extends Command {

  name = 'ExportItems';

  /**
   * @constructor
   * @param {CommandDecorator} commandDecorator
   */
  constructor(commandDecorator) {
    super(commandDecorator);

    this.setSuccessMessage('Export effectué');
    this.setErrorMessage('Une erreur est survenue lors de l\'export des éléments');
    this.setExecuteCallback(new FileCallsRequest().downloadCsv.bind(null));
  }

}

export default ExportItems;