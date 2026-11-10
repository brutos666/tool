'use strict';

import StoreData from '../data/StoreData.js';
import { URL_ROOT_API } from '../tools/Constants.js';

class CallRequest {

  constructor() {

  }

  /**
   * Appel d'une requête
   * @param {string} requestName - Nom de la requête ("item/xxx")
   * @param {string} method - Type de requête ("GET", "POST", "PUT", "DELETE")
   * @param {Object} data - Données de la requête
   * @returns {Object} contenant les données attendues
   */
  async execute(requestName, method = 'POST', data) {
    let response = await callFetch(requestName, method, data);
    if (response.status === 401) {
      response = await logoutIfRefreshFail.call(this, response, requestName, method, data);
    }
    if (!response.ok) {
      return this.rejectRequest(requestName, response);
    }
    const responseData = await response.json();
    return Promise.resolve(responseData);
  }
  async executeDownloadFile(requestName, method = 'POST', data) {
    let response = await callFetch(requestName, method, data);
    if (response.status === 401) {
      response = await logoutIfRefreshFail.call(this, response, requestName, method, data);
    }
    if (!response.ok) {
      return this.rejectRequest(requestName, response);
    }
    // Lecture du titre du fichier
    let fileName = 'tool.txt';
    // inline; filename="test.pdf"
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition) {
      fileName = getMatchGroupContent(contentDisposition, /filename="(.*)"/) || 'tool.txt';
    }
    const responseData = await response.blob();
    return Promise.resolve({ name: fileName, content: responseData });
  }

  async executeUpload(requestName, file) {
    const formData = new FormData();
    formData.append('fileToUpload', file);
    return this.execute(requestName, 'POST', formData);
  }

  /**
   * Rafraîchissement du token ou redirection sur la page de connection si le rafraîchissement échoue
   * @returns {Object} contenant les données attendues
   */
  async executeRefreshToken() {
    const response = await callFetch('authenticate/refresh', 'POST');
    if (!response.ok) {
      return this.rejectRequest('authenticate/refresh', response);
    }
    const responseData = await response.json();
    return Promise.resolve(responseData);
  }

  async rejectRequest(requestName, response) {
    const contentType = response.headers.get('Content-Type');
    if (contentType === 'application/json') {
      const responseData = await response.json();
      return Promise.reject(`Erreur HTTP ${ response.status } : ${ responseData.error } (${ responseData.path })`);
    }
    const responseData = await response.text();
    return Promise.reject(`Erreur HTTP ${ response.status } : ${ responseData } (${ requestName })`);
  }

}

/**
 * Appel d'une requête
 * @param {string} requestName - Nom de la requête ("item/xxx")
 * @param {string} method - Type de requête ("GET", "POST", "PUT", "DELETE")
 * @param {Object} data - Données de la requête
 * @returns {Promise<Response>}
 */
function callFetch(requestName, method, data = {}) {
  const token = StoreData.getUser()
    ?.getToken();
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${ token }`;
  }
  if (data instanceof FormData) {
    return fetch(URL_ROOT_API + requestName, {
      method,
      headers,
      body: data,
    });
  }
  headers['Content-Type'] = 'application/json';
  if (method === 'GET') {
    return fetch(URL_ROOT_API + requestName, { headers });
  }
  return fetch(URL_ROOT_API + requestName, {
    method,
    headers,
    body: JSON.stringify(data),
  });
}
/**
 * Reconnecte l'utilisateur si son jeton d'authentification a expiré ou n'existe plus puis retente la requête.
 * Déconnecte l'utilisateur s'il ne peut pas être authentifié
 * @param {Response} response - réponse de l'appel d'une requête
 * @param {string} requestName - Nom de la requête ("item/xxx")
 * @param {string} method - Type de requête ("GET", "POST", "PUT", "DELETE")
 * @param {Object} data - Données de la requête
 * @returns {Promise<Response>} réponse à la requête si l'authentification a finalement réussie
 */
function logoutIfRefreshFail(response, requestName, method, data) {
  // Si le jeton a expiré : on le recharge, sinon, on redirige vers la page de connection
  const authenticationReason = response.headers.get('WWW-Authenticate');
  if (authenticationReason === 'Bearer error="token_expired"' || authenticationReason === 'Bearer error="no_token"') {
    return this.executeRefreshToken()
      .then(loggedUser => StoreData.refreshUser(loggedUser), () => StoreData.logout())
      .then(() => callFetch(requestName, method, data));
  }
  StoreData.logout();
  return Promise.resolve();
}
/**
 * Retourne la valeur du groupe recherché dans la chaîne via une expression régulière
 * Par exemple :
 * L'expression régulière '/Nom ="(.*)"/' permet de trouver le nom 'Jane' dans la chaîne suivante
 * 'Email = "jane.doe@boitemail.com", Nom = "Doe", Prénom = "Jane"'
 * @param {string} str - chaîne
 * @param {RegExp} regex Expression régulière. Doit contenir un groupe.
 * @returns {string} chaîne contenant le groupe recherché
 */
function getMatchGroupContent(str, regex) {
  const foundArray = str.match(regex);
  if (!foundArray || foundArray.length < 2) {
    return null;
  }
  return foundArray[1];
}
export default CallRequest;
