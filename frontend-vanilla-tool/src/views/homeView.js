import getHtmlView from './homeView-html.js';
/**
 * Fonction de création de la page principale
 * @param {*} props - Liste des fonctions à appeler lors de la survenue d'un événement
 * @property {object}  props - The default values for parties.
 * @property {function}  props.onSampleClick - Fonction à appeler lors du click sur le bouton d'exemple
 * @returns
 */
function createHomeView(props) {
  const root = document.createElement('div');
  root.innerHTML = getHtmlView();

  /** @HTMLTextAreaElement */
  const inputTextArea = root.querySelector('#input');
  /** @HTMLButtonElement */
  const taskButton = root.querySelector('#task-button');

  taskButton.addEventListener('click', props.onSampleClick);

  const updateInput = (textContent) => {
    inputTextArea.value = textContent;
  };

  return { root, updateInput };
}

export default createHomeView;
