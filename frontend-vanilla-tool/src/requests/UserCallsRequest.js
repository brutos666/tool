import CallRequest from './CallRequest.js';
/** @import {RegisterUserInfos} from '../components/LoginSpace.js'; */
/** @import {LoginInfos} from '../components/LoginSpace.js'; */

class UserCallsRequest {

  constructor() {
  }

  /**
   * Inscrit l'utilisateur
   * @param {RegisterUserInfos} registerUserInfos : informations sur l'utilisateur qui veut s'inscrire
   */
  async signUp(registerUserInfos) {
    return new CallRequest()
      .execute('user/signup', 'POST', registerUserInfos);
  }

  /**
   * Connecte l'utilisateur à sa session
   * @param {LoginInfos} loginInfos
   */
  async logUserIn(loginInfos) {
    return new CallRequest()
      .execute('user/login', 'POST', loginInfos);
  }

  /**
   * Retourne la liste des tâches du jour
   * @returns {Array<UserInfos>} - Liste des tâches du jour
   */
  async getAllUsers() {
    return new CallRequest()
      .execute('item/findAllUSers', 'GET');
  }

}
export default UserCallsRequest;