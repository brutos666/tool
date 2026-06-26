import CallRequest from './CallRequest.js';
/** @import {UserInfos} from '../data/User.js'; */

class UserCallsRequest {

  constructor() {
  }

  /**
   * Inscrit l'utilisateur
   * @param {UserInfos} userInfos
   */
  async signUp(userInfos) {
    return new CallRequest()
      .execute('user/signup', 'POST', userInfos);
  }

  /**
   * Connecte l'utilisateur à sa session
   * @param {UserInfos} userInfos
   */
  async logUserIn(userInfos) {
    return new CallRequest()
      .execute('user/login', 'POST', userInfos);
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