import UserCallsRequest from '../requests/UserCallsRequest.js';
import Command from './Command.js';
/** @import {UserInfos} from '../data/User.js' */

class UserLogIn extends Command {

  name = 'LogUserIn';

  /**
   * @constructor
   * @param {CommandDecorator} commandDecorator
   * @param {UserInfos} userInfos
   */
  constructor(commandDecorator, userInfos) {
    super(commandDecorator);

    this.setSuccessMessage('Connexion effectuée avec succès');
    this.setErrorMessage('La tentative de connexion a échoué');
    this.setExecuteCallback(new UserCallsRequest().logUserIn.bind(null, userInfos));
  }

}
export default UserLogIn;
