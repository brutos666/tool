import View from './View.js';

class FileUploadView extends View {

  name = 'FileUploadView';

  #fileInput;

  constructor(data) {
    super(data);
    this.#fileInput = this.getElementView()
      .querySelector('input');
  }

  /**
   * @override
   */
  getHtmlView() {
    return String.raw`<div class="file-upload">
      <label for="uploadFile">Sélectionner le fichier à importer (CSV)</label>
      <input id="uploadFile" type="file" accept=".csv"/>
      <template id="applyButton"></template></div>`;
  }

  getSelectedFile() {
    return this.#fileInput.files[0];
  }

}

export default FileUploadView;