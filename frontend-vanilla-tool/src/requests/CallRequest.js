'use strict';

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
  async execute(requestName, method = 'POST', data = {}) {
    const response = await callFetch(requestName, method, data);
    const responseData = await response.json();
    if (!response.ok) {
      return Promise.reject(`Erreur HTTP ${ response.status } : ${ responseData.error } (${ responseData.path })`);
    }
    return Promise.resolve(responseData);
  }
  async executeDownloadFile(requestName, method = 'POST', data = {}) {
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

}

/**
 * Appel d'une requête
 * @param {string} requestName - Nom de la requête ("item/xxx")
 * @param {string} method - Type de requête ("GET", "POST", "PUT", "DELETE")
 * @param {Object} data - Données de la requête
 * @returns {Promise}
 */
function callFetch(requestName, method, data) {
  if (method === 'GET') {
    return fetch(URL_ROOT_API + requestName);
  }
  return fetch(URL_ROOT_API + requestName, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
export default CallRequest;
