'use strict';

import WorkingSpace from './components/WorkingSpace.js';
import StoreData from './data/StoreData.js';

/**
 * Chargement de l'application
 */
function loadApp() {
  StoreData.init()
    .then(() => {
      const workingSpace = new WorkingSpace();
      StoreData.setWorkingSpace(workingSpace);
      document.getElementById('app-root')
        .appendChild(workingSpace.getElementView());
    });
}
window.addEventListener('load', loadApp);
