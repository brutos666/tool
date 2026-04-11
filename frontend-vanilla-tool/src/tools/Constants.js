'use strict';

const URL_ROOT_API = 'http://localhost:8080/api/';
const NOTIFICATION_TIMEOUT = 3000;
const SAVE_TIMEOUT = 5000;

const ACTION = {
  Save: 'Save',
  Delete: 'Delete',
  getActionLabel(action) {
    return ACTION_LABEL[action];
  }
};
const ACTION_LABEL = {
  Save: 'Valider',
  Delete: 'Supprimer'
};
const LAYOUT = {
  CheckList: 'CheckList',
  SampleMapping: 'SampleMapping',
  getOptions() {
    const options = [{ label: '-- Sélectionner la vue --', value: '' }];
    for (const key in LAYOUT) {
      const label = LAYOUT_LABEL[key];
      if (label) {
        options.push({ label, value: key });
      }
    }
    return options;
  }
};
const LAYOUT_LABEL = {
  CheckList: 'CheckList',
  SampleMapping: 'Sample Mapping'
};

const ITEM_LAYOUT = {
  PostIt: 'PostIt',
  Todo: 'Todo',
  Title: 'Tree'
};

const STATE = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE'
};
const RIGHT = {
  create: 'create',
  update: 'update',
  delete: 'delete'
};

export { URL_ROOT_API, ACTION, LAYOUT, STATE, RIGHT, ITEM_LAYOUT, NOTIFICATION_TIMEOUT, SAVE_TIMEOUT };
