'use strict';

const createNode = html => {
  const template = document.createElement('template');

  template.innerHTML = html.trim();
  return template.content.firstChild;
};

export { createNode };