import CallRequest from './CallRequest.js';

class FileCallRequests {

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