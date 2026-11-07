'use strict';

const URL_ROOT_API = '/api/';
const NOTIFICATION_TIMEOUT = 3000;
const SAVE_TIMEOUT = 5000;

const ROOT_ID = '-1';

const STATUS = {
  ORPHAN: 'ORPHAN',
  NEXT_NOT_FOUND: 'NEXT_NOT_FOUND',
  TOTAL_ORPHAN: 'TOTAL_ORPHAN',
  LOOP: 'LOOP'
};
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
  Todo: 'Todo',
  Title: 'Title',
  PostIt: 'PostIt',
  Story: 'Story',
  Rules: 'Rules',
  Sample: 'Sample',
  Question: 'Question',
  isPostIt(layout) {
    return [ ITEM_LAYOUT.PostIt, ITEM_LAYOUT.Story, ITEM_LAYOUT.Rules, ITEM_LAYOUT.Sample, ITEM_LAYOUT.Question ].includes(layout);
  },
  hasDone(layout) {
    return ITEM_LAYOUT.isPostIt(layout) || [ITEM_LAYOUT.Todo].includes(layout);
  },
  hasText(layout) {
    return ITEM_LAYOUT.isPostIt(layout);
  },
  hasFooterToolbar(layout) {
    return layout === ITEM_LAYOUT.Title || layout === ITEM_LAYOUT.Todo;
  },
  getRights(layout) {
    if (ITEM_LAYOUT.isPostIt(layout)) {
      if (layout === ITEM_LAYOUT.Story) {
        return [RIGHT.update];
      }
      return [ RIGHT.update, RIGHT.delete ];
    }
    return [ RIGHT.create, RIGHT.update, RIGHT.delete ];
  }
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
const CRUD_MODE = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  TO_REMOVE: 'TO_REMOVE'
};

export { ACTION, CRUD_MODE, ITEM_LAYOUT, LAYOUT, NOTIFICATION_TIMEOUT, RIGHT, ROOT_ID, SAVE_TIMEOUT, STATE, STATUS, URL_ROOT_API };
