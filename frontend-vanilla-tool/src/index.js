import createHomePage from "./components/homePage.js";

function loadApp() {
  const appRoot = document.getElementById("app-root");

  const { root } = createHomePage();
  appRoot.appendChild(root);
}
window.addEventListener("load", loadApp);
