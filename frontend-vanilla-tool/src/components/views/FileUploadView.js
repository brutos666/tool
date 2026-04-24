import View from './View.js';

class FileUploadView extends View {

  name = 'FileUploadView';

  #fileInput;
  #doActionCallback;

  /**
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   */
  constructor(data) {
    super(data);
    this.#fileInput = this.getElementView()
      .querySelector('input');
    this.getElementView()
      .querySelector('button')
      .addEventListener('click', this.callDoActionCallback.bind(this));
  }

  /**
   * @override {@link View.getHtmlView}
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   * @returns {string} - Code HTML du bouton
   */
  getHtmlView(data) {
    return String.raw`<div class="file-upload">
      <label for="uploadFile">Sélectionner le fichier à importer (CSV)</label>
      <input id="uploadFile" type="file" accept=".csv"/>
      <button id="${ data.id }" class="clickable file-upload__button" role="button">${ data.label }</button></div>`;
  }

  setDoActionCallback(callback) {
    const fileUploadCallback = () => {
      const file = this.#fileInput.files[0];
      if (!file) {
        alert('Veuillez sélectionner un fichier');
        return;
      }
      callback(file);
    };
    this.#doActionCallback = fileUploadCallback;
  }

  getDoActionCallback() {
    return this.#doActionCallback;
  }

  callDoActionCallback() {
    this.#doActionCallback();
  }

}

export default FileUploadView;