import CompositeView from './CompositeView.js';

class TodoListLayoutView extends CompositeView {

  constructor(data) {
    super(data);
  }

  getHtmlView() {
    return String.raw`<div class="todo-list-layout">
      <header class="todo-list-layout__header">Check List<template id="loadItems"></template></header>
      <div id="spaceChildren" class="todo-list todo-list-layout__space"></div>
    </div>`;
  }

}

export default TodoListLayoutView;