'use strict';

import LoginSpace from './components/LoginSpace.js';
import StoreData from './data/StoreData.js';

/**
 * Chargement de l'application
 */
function loadApp() {
  const appRoot = document.getElementById('app-root');

  StoreData.logPageInit();

  const loginPage = new LoginSpace();
  appRoot.appendChild(loginPage.getElementView());
}
window.addEventListener('load', loadApp);