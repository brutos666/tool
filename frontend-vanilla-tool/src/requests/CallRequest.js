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
      // Si le jeton a expiré : on le recharge, sinon, on redirige vers la page de connection
      const authenticationReason = response.headers.get('WWW-Authenticate');
      if (authenticationReason === 'Bearer error="token_expired"' || authenticationReason === 'Bearer error="no_token"') {
        response = this.executeRefreshToken()
          .then(
            () => callFetch(requestName, method, data),
            () => StoreData.logout()
          );
      } else {
        StoreData.logout();
      }
    }

    const responseData = await response.json();
    if (!response.ok) {
      return Promise.reject(`Erreur HTTP ${ response.status } : ${ responseData.error } (${ responseData.path })`);
    }
    return Promise.resolve(responseData);
  }
  async executeDownloadFile(requestName, method = 'POST', data) {
    const response = await callFetch(requestName, method, data);
    if (!response.ok) {
      const responseData = await response.json();
      return Promise.reject(`Erreur HTTP ${ response.status } : ${ responseData.error } (${ responseData.path })`);
    }
    const responseData = await response.blob();
    return Promise.resolve(responseData);
  }

  async executeUpload(requestName, file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(URL_ROOT_API + requestName, {
      method: 'POST',
      body: formData
    });
    const responseData = await response.json();
    if (!response.ok) {
      return Promise.reject(`Erreur HTTP ${ response.status } : ${ responseData.error } (${ responseData.path })`);
    }
    return Promise.resolve(responseData);
  }

  /**
   * Rafraîchissement du token ou redirection sur la page de connection si le rafraichissement échoue
   * @returns {Object} contenant les données attendues
   */
  async executeRefreshToken() {
    const response = await callFetch('authenticate/refresh', 'POST');
    const responseData = await response.json();
    if (!response.ok) {
      return Promise.reject(`Erreur HTTP ${ response.status } : ${ responseData.error } (${ responseData.path })`);
    }
    return Promise.resolve(responseData);
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
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${ token }`;
  }
  if (method === 'GET') {
    return fetch(URL_ROOT_API + requestName, { headers });
  }
  return fetch(URL_ROOT_API + requestName, {
    method,
    headers,
    body: JSON.stringify(data),
  });
}
export default CallRequest;
