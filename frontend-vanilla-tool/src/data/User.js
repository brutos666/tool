/**
 * @typedef {Object} UserInfos - Informations sur l'utilisateur
 * @property {number} id - Identifiant unique
 * @property {string} email - Email
 * @property {string} firstName - Prénom
 * @property {string} lastName - Nom
 * @property {string} password - Mot de passe
 * @property {'ADMIN'|'USER'} role - Mot de passe
 */
class User {

  name = 'User';

  /** @type {UserInfos} */
  #userInfos;

  constructor(userInfos) {
    this.#userInfos = userInfos;
  }
  getEmail() {
    return this.#userInfos.email;
  }
  /**
   * Retourne les informations sur l'utilisateur
   * @returns {UserInfos}
   */
  getUserInfos() {
    return this.#userInfos;
  }

}
export default User;