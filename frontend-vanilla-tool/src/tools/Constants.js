'use strict';

const URL_ROOT_API = 'http://localhost:8080/api/';

const ACTION = {
  Create: 'Create',
  Update: 'Update',
  Delete: 'Delete',
  Clear: 'Clear',
  getActionLabel(action) {
    return ACTION_LABEL[action];
  }
};
const ACTION_LABEL = {
  Create: 'Valider',
  Update: 'Modifier',
  Delete: 'Supprimer',
  Clear: 'Effacer'
};

export { URL_ROOT_API, ACTION };
