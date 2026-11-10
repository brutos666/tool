import CallRequest from './CallRequest.js';
/** @import {ItemInfos} from '../data/TreeItem.js'; */
/**
 * @typedef {Object} DownloadFile - Informations sur l'item
 * @property {string} name - Nom du fichier
 * @property {Blob} content - Contenu du fichier
 */
class FileCallRequests {

  /**
   * Insère les tâches affichées de l'arbre dans un fichier csv et retourne le fichier à l'utilisateur
   * @param {TreeInfos} treeInfos - Tâche à sauvegarder, ses enfants, l'identifiant du précédent et du suivant
   */
  async downloadItemCsv(treeInfos) {
    /** @type {DownloadFile} */
    const file = await new CallRequest()
      .executeDownloadFile('export/items', 'POST', treeInfos);

    const url = window.URL.createObjectURL(file.content);

    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();

    window.URL.revokeObjectURL(url);
  }

  /**
   * Insère les tâches issues de la base de données dans un fichier csv et le retourne à l'utilisateur
   */
  async downloadCsv() {
    const blob = await new CallRequest()
      .executeDownloadFile('export/allItems', 'GET');

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'items.csv'; // nom par défaut
    a.click();

    window.URL.revokeObjectURL(url);
  }

  /**
   * Insère les tâches du fichier sélectionné dans la base de données et retourne le résultat
   * @param {File} fileUpload
   * @returns {Array<ItemInfos>} - Liste de la tâche précédente modifiée et des taches crées
   */
  async uploadCsv(fileUpload) {
    if (!fileUpload) {
      alert('Veuillez sélectionner un fichier');
      return;
    }
    return await new CallRequest()
      .executeUpload('import/items', fileUpload);
  }

}

export default FileCallRequests;