/**
 * @typedef {Object} LoggedUser
 * @property {string} firstName - Prénom
 * @property {string} lastName - Nom
 * @property {string} token - Jeton d'authentification
 */

class User {

  name = 'User';

  /** @type {LoggedUser} */
  #userInfos;

  constructor(userInfos) {
    this.#userInfos = userInfos;
  }
  getToken() {
    return this.#userInfos.token;
  }
  /**
   * Retourne les informations sur l'utilisateur
   * @returns {LoggedUser}
   */
  getUserInfos() {
    return this.#userInfos;
  }

}
export default User;