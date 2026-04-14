import Command from './Command.js';
import FileCallsRequest from '../requests/FileCallsRequest.js';

class ExportItems extends Command {

  name = 'ExportItems';

  /**
   * @constructor
   * @param {ActionsDecorator} actionDecorator
   */
  constructor(actionDecorator) {
    super(actionDecorator);

    this.setSuccessMessage('Export effectué');
    this.setErrorMessage('Une erreur est survenue lors de l\'export des éléments');
    this.setExecuteCallback(new FileCallsRequest().downloadCsv.bind(null));
  }

}

export default ExportItems;