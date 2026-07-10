import StoreData from '../data/StoreData.js';
import UserCallsRequest from '../requests/UserCallsRequest.js';
import Command from './Command.js';
/** @import {LoginInfos} from '../components/LoginSpace.js' */
/** @import {LoggedUser} from '../data/User.js'; */

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
   * @param {LoggedUser} loggedUser - utilisateur connecté
   */
  commandDone(loggedUser) {
    super.commandDone();
    StoreData.login(loggedUser);
  }

}
export default UserLogin;
