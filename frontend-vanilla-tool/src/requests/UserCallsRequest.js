import StoreData from '../data/StoreData.js';
import CallRequest from './CallRequest.js';
/** @import {RegisterUserInfos} from '../components/LoginSpace.js'; */
/** @import {LoginInfos} from '../components/LoginSpace.js'; */
/** @import {LoggedUser} from '../data/User.js'; */

class UserCallsRequest {

  constructor() {
  }

  /**
   * Inscrit l'utilisateur
   * @param {RegisterUserInfos} registerUserInfos : informations sur l'utilisateur qui veut s'inscrire
   * @returns {Promise<LoggedUser>} - Promesse contenant l'utilisateur connecté
   */
  async signUp(registerUserInfos) {
    return new CallRequest()
      .execute('authenticate/signup', 'POST', registerUserInfos);
  }

  /**
   * Connecte l'utilisateur à sa session
   * @param {LoginInfos} loginInfos
   * @returns {Promise<LoggedUser>} - Promesse contenant l'utilisateur connecté
   */
  async logUserIn(loginInfos) {
    return new CallRequest()
      .execute('authenticate/login', 'POST', loginInfos);
  }

  /**
   * Rafraîchit les informations de connection de l'utilisateur (utilise le refreshToken)
   * @returns {Promise<LoggedUser>} - Promesse contenant l'utilisateur connecté
   */
  async refreshToken() {
    return new CallRequest()
      .executeRefreshToken()
      .catch(() => StoreData.logout());
  }

}
export default UserCallsRequest;