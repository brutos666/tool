'use strict';

import HomePage from './components/HomePage.js';

function loadApp() {
  const appRoot = document.getElementById('app-root');
  const homePage = new HomePage();

  appRoot.appendChild(homePage.getNodeView());
}
window.addEventListener('load', loadApp);
