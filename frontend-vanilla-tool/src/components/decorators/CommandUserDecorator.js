import UserLogIn from '../../commands/UserLogIn.js';
import UserSignUp from '../../commands/UserSignUp.js';
import CommandDecorator from './CommandDecorator.js';
/** @import {UserInfos} from '../../data/User.js' */

class CommandUserDecorator extends CommandDecorator {

  /**
   * @constructor
   * @param {Component} decoratedElement
   */
  constructor(decoratedElement) {
    super(decoratedElement);
  }

  /**
   * Connexion
   * @param {UserInfos} userInfos : informations sur l'utilisateur
   */
  logIn(userInfos) {
    new UserLogIn(this, userInfos)
      .execute();
  }
  /**
   * Inscription
   * @param {UserInfos} userInfos : informations sur l'utilisateur
   */
  signup(userInfos) {
    new UserSignUp(this, userInfos)
      .execute();
  }

}
export default CommandUserDecorator;