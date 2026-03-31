'use strict';

const createNode = html => {
  const template = document.createElement('template');

  template.innerHTML = html.trim();
  return template.content.firstChild;
};
/**
 * Convertit une feuille en un noeud (div = details + summary + spaceChildren)
 * @param {Element} elementView - Élément feuille à convertir
 * @returns {Element} - Élément noeud
 */
function convertLeafToDetails(elementView) {
  const detailsNode = document.createElement('details');
  detailsNode.classList = elementView.classList;
  detailsNode.classList.remove('tree__leaf');
  if (!detailsNode.classList.contains('tree__root')) {
    detailsNode.classList.add('tree__node');
  }
  const summaryNode = document.createElement('summary');
  detailsNode.appendChild(summaryNode);
  for (const child of elementView.children) {
    summaryNode.appendChild(child);
  }
  const spaceChildrenNode = document.createElement('section');
  spaceChildrenNode.id = 'spaceChildren';
  detailsNode.appendChild(spaceChildrenNode);
  elementView.parentNode.replaceChild(detailsNode, elementView);
  return detailsNode;
}
/**
 * Convertit un noeud en une feuille (details + summary + spaceChildren => div)
 * @param {Element} elementView - Élément noeud à convertir
 * @returns {Element} - Élément feuille
 */
function convertDetailsToLeaf(elementView) {
  const divNode = document.createElement('div');
  divNode.classList = elementView.classList;
  divNode.classList.add('tree__leaf');
  divNode.classList.remove('tree__node');
  const summaryNode = elementView.querySelector('summary');
  for (const child of summaryNode.children) {
    // Exclure ::before
    if (child.textContent === '::before') {
      continue;
    }
    divNode.appendChild(child);
  }
  elementView.parentNode.replaceChild(divNode, elementView);
  return divNode;
}

export { createNode, convertLeafToDetails, convertDetailsToLeaf };