import View from './View.js';

class TodoListLayoutView extends View {

  name = 'TodoListLayoutView';

  constructor(data) {
    super(data);
  }

  getHtmlView() {
    return String.raw`<div class="todo-list-layout">
      <header class="todo-list-layout__header">Check List<template id="loadItems"></template></header>
      <template id="todoItems" class="todo-list-layout__space"></template>
    </div>`;
  }

}

export default TodoListLayoutView;