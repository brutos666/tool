import UserCallsRequest from '../requests/UserCallsRequest.js';
import Command from './Command.js';
/** @import {UserInfos} from '../data/User.js' */

class UserSignUp extends Command {

  name = 'UserSignUp';

  /**
   * @constructor
   * @param {CommandDecorator} commandDecorator
   * @param {UserInfos} userInfos
   */
  constructor(commandDecorator, userInfos) {
    super(commandDecorator);

    this.setSuccessMessage('Inscription effectuée avec succès');
    this.setErrorMessage('Une erreur est survenue lors de l\'inscription de l\'utilisateur');
    this.setExecuteCallback(new UserCallsRequest().signUp.bind(null, userInfos));
  }

}
export default UserSignUp;
