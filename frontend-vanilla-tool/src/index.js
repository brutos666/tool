'use strict';

import WorkingSpace from './components/WorkingSpace.js';
import StoreData from './data/StoreData.js';

/**
 * Chargement de l'application
 */
function loadApp() {
  const appRoot = document.getElementById('app-root');

  StoreData.init()
    .then(() => {
      const homePage = new WorkingSpace();
      appRoot.appendChild(homePage.getElementView());
    });
}
window.addEventListener('load', loadApp);
