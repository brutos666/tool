import UserCallsRequest from '../requests/UserCallsRequest.js';
import Command from './Command.js';
/** @import {LoginInfos} from '../components/LoginSpace.js' */

class UserLogin extends Command {

  name = 'UserLogin';

  /**
   * @constructor
   * @param {CommandDecorator} commandDecorator
   * @param {LoginInfos} logInfos
   */
  constructor(commandDecorator, logInfos) {
    super(commandDecorator);

    this.setSuccessMessage('Connexion effectuée avec succès');
    this.setErrorMessage('La tentative de connexion a échoué');
    this.setExecuteCallback(new UserCallsRequest().logUserIn.bind(null, logInfos));
  }

  /**
   * @override
   */
  commandDone() {
    super.commandDone();
    window.location.href = 'index.html';
  }

}
export default UserLogin;
