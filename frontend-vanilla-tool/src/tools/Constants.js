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

const VIEW_CHOICE = {
  Detail: 'Detail',
  SampleMapping: 'SampleMapping',
  TodoList: 'TodoList',
  Tree: 'Tree',
  getOptions() {
    const options = [{ label: '-- Sélectionner la vue --', value: '' }];
    for (const key in VIEW_CHOICE) {
      const label = VIEW_CHOICE_LABEL[key];
      if (label) {
        options.push({ label, value: key });
      }
    }
    return options;
  }
};
const VIEW_CHOICE_LABEL = {
  Detail: 'Vue détaillée',
  SampleMapping: 'Sample Mapping',
  TodoList: 'Todo List',
  Tree: 'Arbre hiérarchique'
};
const STATE = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE'
};

export { URL_ROOT_API, ACTION, STATE, VIEW_CHOICE, NOTIFICATION_TIMEOUT, SAVE_TIMEOUT };
