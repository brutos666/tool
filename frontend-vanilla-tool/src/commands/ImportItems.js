import Command from './Command.js';
import FileCallsRequest from '../requests/FileCallsRequest.js';
/** @import CommandActionDecorator from '../components/decorators/CommandActionDecorator.js'; */

class ImportItems extends Command {

  name = 'ImportItems';

  /**
   * @constructor
   * @param {CommandActionDecorator} actionDecorator
   * @param {FileUpload} fileUpload
   */
  constructor(actionDecorator, fileUpload) {
    super(actionDecorator);

    this.setSuccessMessage('Import effectué');
    this.setErrorMessage('Une erreur est survenue lors de l\'import des éléments');
    this.setExecuteCallback(new FileCallsRequest().uploadCsv.bind(null, fileUpload));
  }

}

export default ImportItems;