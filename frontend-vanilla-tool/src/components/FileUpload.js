import FileUploadView from './views/FileUploadView.js';
import ActionButton from './ActionButton.js';
import Component from './Component.js';

class FileUpload extends Component {

  name = 'FileUpload';

  #applyButton;

  /**
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   */
  constructor(data) {
    super(new FileUploadView(data));
    this.#applyButton = new ActionButton({
      id: data.id,
      label: data.label,
      type: 'label',
      role: 'button'
    });
    this.setStaticChild('applyButton', this.#applyButton);
  }

  setDoActionCallback(callback) {
    const fileUploadCallback = () => {
      const file = this.getView()
        .getSelectedFile();
      if (!file) {
        alert('Veuillez sélectionner un fichier');
        return;
      }
      callback(file);
    };
    this.#applyButton.setDoActionCallback(fileUploadCallback);
  }

}

export default FileUpload;