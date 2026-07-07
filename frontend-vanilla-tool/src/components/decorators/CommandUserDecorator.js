import UserLogin from '../../commands/UserLogIn.js';
import UserSignUp from '../../commands/UserSignUp.js';
import CommandDecorator from './CommandDecorator.js';
/** @import {RegisterUserInfos} from '../../components/LoginSpace.js' */
/** @import {LoginInfos} from '../../components/LoginSpace.js' */

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
   * @param {LoginInfos} loginInfos : informations sur l'utilisateur
   */
  logIn(loginInfos) {
    new UserLogin(this, loginInfos)
      .execute();
  }
  /**
   * Inscription
   * @param {RegisterUserInfos} registerUserInfos : informations sur l'utilisateur qui veut s'inscrire
   */
  signup(registerUserInfos) {
    new UserSignUp(this, registerUserInfos)
      .execute();
  }

}
export default CommandUserDecorator;