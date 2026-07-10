import StoreData from '../data/StoreData.js';
import UserCallsRequest from '../requests/UserCallsRequest.js';
import Command from './Command.js';
/** @import {RegisterUserInfos} from '../components/LoginSpace.js' */
/** @import {LoggedUser} from '../data/User.js'; */

class UserSignUp extends Command {

  name = 'UserSignUp';

  /**
   * @constructor
   * @param {CommandDecorator} commandDecorator
   * @param {RegisterUserInfos} registerUserInfos : informations sur l'utilisateur qui veut s'inscrire
   */
  constructor(commandDecorator, registerUserInfos) {
    super(commandDecorator);

    this.setSuccessMessage('Inscription effectuée avec succès');
    this.setErrorMessage('Une erreur est survenue lors de l\'inscription de l\'utilisateur');
    this.setExecuteCallback(new UserCallsRequest().signUp.bind(null, registerUserInfos));
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
export default UserSignUp;
