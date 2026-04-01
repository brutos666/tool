'use strict';

import WorkingSpace from './components/WorkingSpace.js';

/**
 * Chargement de l'application
 */
function loadApp() {
  const appRoot = document.getElementById('app-root');
  const homePage = new WorkingSpace();

  appRoot.appendChild(homePage.getNodeView());
}
window.addEventListener('load', loadApp);
