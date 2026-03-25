'use strict';

import { URL_ROOT_API } from '../tools/Constants.js';

/**
 * Appel d'une requête
 * @param {string} requestName - Nom de la requête ("task/xxx")
 * @param {string} method - Type de requête ("GET", "POST", "PUT", "DELETE")
 * @param {Object} data - Données de la requête
 * @returns {Object} contenant les données attendues
 */
async function callRequestApi(requestName, method = 'POST', data = {}) {
  let response;

  if (method === 'GET') {
    response = await fetch(URL_ROOT_API + requestName);
  } else {
    response = await fetch(URL_ROOT_API + requestName, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }
  const responseData = await response.json();

  if (!response.ok) {
    // Mettre à jour un message d'erreur sur l'élément
    const message = `Erreur HTTP ${ response.status } : ${ responseData.error } (${ responseData.path })`;

    return Promise.reject(message);
  }
  return Promise.resolve(responseData);
}

export { callRequestApi };
