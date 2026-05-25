import TreeUtilities from './TreeUtilities.js';

class NavigationUtilities {

  /**
   * Donne l'élément frère suivant dans le DOM qui a la classe donnée et n'a pas la classe interdite.
   * On recherche le frère direct ou le frère se trouvant dans la branche suivante à condition que l'élément soit seul dans sa branche.
   * Si l'élément suivant ne contient pas la classe demandée, on ne cherche pas plus loin
   * @param {HTMLElement} element
   * @param {string} givenClass
   * @param {string} forbiddenClass
   * @returns {HTMLElement} Element suivant
   */
  static getNextElementSibling(element, givenClass, forbiddenClass) {
    return this.getElementSibling(element, 'next', givenClass, forbiddenClass);
  }

  /**
   * Donne l'élément frère précédent dans le DOM qui a la classe donnée et n'a pas la classe interdite.
   * On recherche le frère direct ou le frère se trouvant dans la branche précédente à condition que l'élément soit seul dans sa branche.
   * Si l'élément suivant ne contient pas la classe demandée, on ne cherche pas plus loin
   * @param {HTMLElement} element
   * @param {string} givenClass
   * @param {string} forbiddenClass
   * @returns {HTMLElement} Element suivant
   */
  static getPreviousElementSibling(element, givenClass, forbiddenClass) {
    return this.getElementSibling(element, 'previous', givenClass, forbiddenClass);
  }
  /**
   * Donne l'élément frère dans le DOM qui a la classe donnée et n'a pas la classe interdite.
   * On recherche le frère direct ou le frère se trouvant dans la branche suivante à condition que l'élément soit seul dans sa branche.
   * Si l'élément suivant ne contient pas la classe demandée, on ne cherche pas plus loin
   * @param {HTMLElement} element
   * @param {'next'|'previous'} direction
   * @param {string} givenClass
   * @param {string} forbiddenClass
   * @returns {HTMLElement} Element suivant
   */
  static getElementSibling(element, direction, givenClass, forbiddenClass) {
    /** @type {HTMLElement} */
    let nextElement = direction === 'next' ? element.nextElementSibling : element.previousElementSibling;
    if (!nextElement) {
      const nextBranch = getBranchSibling(element, direction);
      nextElement = nextBranch?.querySelector(`.${ givenClass }`);
    }
    if (nextElement) {
      if (nextElement.classList.contains(givenClass) && !nextElement.classList.contains(forbiddenClass)) {
        return nextElement;
      }
      return this.getElementSibling(nextElement, direction, givenClass, forbiddenClass);
    }
    return null;
  }

  /**
   * Récupère l'élément suivant (ordre DOM) dans un arbre DOM donné
   * @param {HTMLElement} element - Element
   * @param {'next'|'previous'} direction
   * @param {HTMLElement} nodeParent - Arbre dans lequel rechercher
   * @param {string} givenClass - Classe recherchée
   * @returns {HTMLElement} Element suivant
   */
  static getNextElement(element, direction, nodeParent, givenClass) {
    const allElements = [...nodeParent.querySelectorAll(`.${ givenClass }`)];
    // Exclure les éléments non visibles car dans le noeud d'un arbre fermé
    const filteredElements = allElements.filter(element => !element.closest('[aria-expanded="false"]'));
    const index = filteredElements.indexOf(element);
    if (index === -1) {
      return null;
    }
    const nextElement = direction === 'next' ? filteredElements[index + 1] : filteredElements[index - 1];
    if (nextElement) {
      return nextElement;
    }
    return null;
  }

  /**
   * Recherche le 1er élément autorisé en dessous de l'élément courant
   * @param {HTMLElement} element - Element
   * @param {HTMLElement} nodeParent - Arbre dans lequel rechercher
   * @param {string} givenClass - Classe recherchée
   * @param {string} forbiddenClass - Classe interdite
   * @returns {HTMLElement} Element recherché
   */
  static getNextElementDown(element, nodeParent, givenClass, forbiddenClass) {
    return this.getElementDirection(element, 'next', 'vertical', nodeParent, givenClass, forbiddenClass);
  }
  /**
   * Recherche le 1er élément autorisé au dessus de l'élément courant
   * @param {HTMLElement} element - Element
   * @param {HTMLElement} nodeParent - Arbre dans lequel rechercher
   * @param {string} givenClass - Classe recherchée
   * @param {string} forbiddenClass - Classe interdite
   * @returns {HTMLElement} Element recherché
   */
  static getNextElementUp(element, nodeParent, givenClass, forbiddenClass) {
    return this.getElementDirection(element, 'previous', 'vertical', nodeParent, givenClass, forbiddenClass);
  }
  /**
   * Recherche le 1er élément autorisé à gauche de l'élément courant
   * @param {HTMLElement} element - Element
   * @param {HTMLElement} nodeParent - Arbre dans lequel rechercher
   * @param {string} givenClass - Classe recherchée
   * @param {string} forbiddenClass - Classe interdite
   * @returns {HTMLElement} Element recherché
   */
  static getNextElementLeft(element, nodeParent, givenClass, forbiddenClass) {
    return this.getElementDirection(element, 'previous', 'horizontal', nodeParent, givenClass, forbiddenClass);
  }
  /**
   * Recherche le 1er élément autorisé à droite de l'élément courant
   * @param {HTMLElement} element - Element
   * @param {HTMLElement} nodeParent - Arbre dans lequel rechercher
   * @param {string} givenClass - Classe recherchée
   * @param {string} forbiddenClass - Classe interdite
   * @returns {HTMLElement} Element recherché
   */
  static getNextElementRight(element, nodeParent, givenClass, forbiddenClass) {
    return this.getElementDirection(element, 'next', 'horizontal', nodeParent, givenClass, forbiddenClass);
  }

  /**
   * Récupère l'élément voisin de l'élément dans une direction dans un arbre DOM donné
   * NOTE : LE DOM doit indiquer l'orientation (horizontal pour une ligne, vertical pour une colonne)
   * @param {HTMLElement} element - Element
   * @param {'next'|'previous'} direction - Suivant ou précédent
   * @param {'horizontal'|'vertical'} orientation - Orientation
   * @param {HTMLElement} nodeParent - Arbre dans lequel rechercher
   * @param {string} givenClass - Classe recherchée
   * @param {string} forbiddenClass - Classe interdite
   * @returns {HTMLElement} Element voisin
   */
  static getElementDirection(element, direction, orientation, nodeParent, givenClass, forbiddenClass) {
    const cell = element.closest('th, td');
    if (cell) {
      return this.getCellElementDirection(element, direction, orientation, nodeParent, givenClass, forbiddenClass);
    }
    const treeList = element.closest('[role="tree"]');
    if (treeList) {
      return this.getTreeElementDirection(element, direction, orientation, treeList, givenClass, forbiddenClass);
    }
  }

  /**
   * Recherche de l'élément suivant pour la même orientation :
   * les conteneurs horizontaux ou verticaux peuvent s'imbriquer dans les arbres d'arbres.
   * @param {HTMLElement} element - Element
   * @param {'next'|'previous'} direction - Suivant ou précédent
   * @param {'horizontal'|'vertical'} orientation - Orientation
   * @param {HTMLElement} nodeParent - Arbre dans lequel rechercher
   * @param {string} givenClass - Classe recherchée
   * @returns {HTMLElement} Element voisin
   */
  static getElementOrientated(element, direction, orientation, nodeParent, givenClass) {
    const allElements = [...nodeParent.querySelectorAll(`.${ givenClass }`)];
    const filteredElements = allElements
      .filter(element => {
        if (element.closest('[aria-expanded="false"]')) {
          // Exclure les éléments non visibles car dans le noeud d'un arbre fermé
          return false;
        }
        const orientationElement = element.closest('[aria-orientation]');
        if (orientationElement) {
          // Exclure les éléments qui se trouvent dans une orientation différente
          return orientationElement.getAttribute('aria-orientation') === orientation;
        }
        return true;
      });
    const index = filteredElements.indexOf(element);
    if (index === -1) {
      return null;
    }
    const nextElement = direction === 'next' ? filteredElements[index + 1] : filteredElements[index - 1];
    if (nextElement) {
      return nextElement;
    }
    return null;
  }
  /**
   * Récupère l'élément situé à côté de l'élément dans une direction dans un arbre DOM donné
   * @param {HTMLTableCellElement} element - Element
   * @param {'next'|'previous'} direction - Suivant ou précédent
   * @param {'horizontal'|'vertical'} orientation - Orientation
   * @param {HTMLElement} treeList - Arbre dans lequel rechercher
   * @param {string} givenClass - Classe recherchée
   * @param {string} forbiddenClass - Classe interdite
   * @returns {HTMLElement} Element suivant
   */
  static getTreeElementDirection(element, direction, orientation, treeList, givenClass, forbiddenClass) {
    const treeItem = TreeUtilities.getTreeElement(element);
    const nextElement = orientation === 'vertical'
      ? TreeUtilities.getVerticalNextElement(treeItem, direction, givenClass)
      : TreeUtilities.getHorizontalNextElement(treeItem, direction, givenClass);

    if (nextElement?.classList.contains(forbiddenClass)) {
      return this.getTreeElementDirection(nextElement, direction, orientation, treeList, givenClass, forbiddenClass);
    }
    return nextElement;
  }

  /**
   * Récupère l'élément situé à côté de l'élément dans une direction dans une table DOM donné
   * @param {HTMLTableCellElement} element - Element
   * @param {'next'|'previous'} direction - Suivant ou précédent
   * @param {'horizontal'|'vertical'} orientation - Orientation
   * @param {HTMLElement} nodeParent - Arbre dans lequel rechercher
   * @param {string} givenClass - Classe recherchée
   * @param {string} forbiddenClass - Classe interdite
   * @returns {HTMLElement} Element suivant
   */
  static getCellElementDirection(element, direction, orientation, nodeParent, givenClass, forbiddenClass) {
    // NOTE : La cellule peut contenir plusieurs éléments
    const cell = element.closest('th, td');
    let nextElement = null;
    const elementsOrientationInCell = getContainerOrientation(element, cell);
    if (elementsOrientationInCell === orientation) {
      // Recherche de l'élément suivant dans la cellule
      nextElement = this.getNextElement(element, direction, cell, givenClass);
    }
    if (!nextElement) {
      // Recherche de l'élément voisin dans la cellule suivante
      nextElement = this.getCellSiblingElement(element, direction, orientation, cell, givenClass, forbiddenClass);
    }
    if (nextElement?.classList.contains(forbiddenClass)) {
      return this.getCellElementDirection(nextElement, direction, orientation, nodeParent, givenClass, forbiddenClass);
    }
    return nextElement ? nextElement : null;
  }

  /**
   * Récupère l'élément voisin de l'élément dans une cellule voisine
   * @param {HTMLElement} element - Element
   * @param {'next'|'previous'} direction - Suivant ou précédent
   * @param {'horizontal'|'vertical'} orientation - Orientation
   * @param {HTMLTableCellElement} cell - Cellule
   * @param {string} givenClass - Classe recherchée
   * @returns {HTMLElement} Element voisin
   */
  static getCellSiblingElement(element, direction, orientation, cell, givenClass) {
    const nextCell = this.getCellSibling(cell, direction, orientation);
    if (!nextCell) {
      return null;
    }
    const cellElements = cell.querySelectorAll(`.${ givenClass }`);
    const indexOfElement = [...cellElements].indexOf(element);

    const elementsOrientationInCell = getContainerOrientation(element, cell);
    const nextCellElements = nextCell.querySelectorAll(`.${ givenClass }`);
    return elementsOrientationInCell === orientation ? nextCellElements[0] : nextCellElements[indexOfElement];
  }

  /**
   * Récupère la cellule voisine de la cellule dans une direction
   * @param {HTMLTableCellElement} cell - Cellule
   * @param {'next'|'previous'} direction - Suivant ou précédent
   * @param {'horizontal'|'vertical'} orientation - Orientation
   * @returns {HTMLTableCellElement} Cellule suivante
   */
  static getCellSibling(cell, direction, orientation) {
    if (orientation === 'horizontal') {
      return direction === 'next' ? cell.nextElementSibling : cell.previousElementSibling;
    }
    if (orientation !== 'vertical') {
      return null;
    }
    /** @type {HTMLTableElement} */
    const table = cell.closest('table');
    const rowIndex = cell.parentNode.rowIndex;
    /** @type {HTMLTableRowElement} */
    const nextRow = direction === 'next' ? table.rows[rowIndex + 1] : table.rows[rowIndex - 1];
    return nextRow?.cells[cell.cellIndex];
  }

  /**
   * Recherche le prochain élément autorisée dans les branches suivantes
   * @param {HTMLElement} branch - Branche
   * @param {'next'|'previous'} direction - Suivant ou précédent
   * @param {string} givenClass - Classe recherchée
   * @param {string} forbiddenClass - Classe interdite
   * @returns {HTMLElement}
   */
  static getNextBranchElement(branch, direction, givenClass, forbiddenClass) {
    const nextBranch = direction === 'next' ? branch.nextElementSibling : branch.previousElementSibling;
    if (!nextBranch) {
      return null;
    }
    const elements = [...nextBranch.querySelectorAll(`.${ givenClass }:not(.${ forbiddenClass })`)];
    if (elements.length === 0) {
      return this.getNextBranchElement(nextBranch, direction, givenClass, forbiddenClass);
    }
    return elements[0];
  }

  static getBranch(orientation, nodeParent, element) {
    let node = element;
    while (node !== nodeParent && node.parentNode
      && (!node.parentNode.hasAttribute('aria-orientation')
      || node.parentNode.getAttribute('aria-orientation') !== orientation)) {
      node = node.parentNode;
    }
    return node === nodeParent ? null : node;
  }

  static getElementAtPosition(conteneur, givenClass, position) {
    const elements = [...conteneur.querySelectorAll(`.${ givenClass }`)];
    if (elements[position]) {
      return elements[position];
    }
    return null;
  }

  static getPositionOfElement(conteneur, givenClass, element) {
    const elements = [...conteneur.querySelectorAll(`.${ givenClass }`)];
    return elements.indexOf(element);
  }

}
/**
 * Récupère l'orientation du conteneur de l'élément
 * @param {HTMLElement} element - Element
 * @param {HTMLElement} nodeParent - Noeud dans lequel on fait la recherche
 * @returns {string} Orientation
 */
function getContainerOrientation(element, nodeParent) {
  const containerElement = element.closest('[aria-orientation]');
  if (containerElement && nodeParent.contains(containerElement)) {
    return containerElement.getAttribute('aria-orientation');
  }
  return 'vertical';
}
/**
 * Récupère le conteneur racine ayant la même orientation que celle demandée
 * @param {HTMLElement} element - Element
 * @param {'horizontal'|'vertical'} orientation - Orientation
 * @returns {HTMLElement} Conteneur racine
 */
function getRootWithOrientation(element, orientation) {
  let container = element.closest('[aria-orientation]');
  let containerOk = null;
  while (container?.getAttribute('aria-orientation') === orientation) {
    containerOk = container;
    container = container.parentNode?.closest?.('[aria-orientation]');
  }
  return containerOk;
}
/**
 * Récupère la branche voisine de l'élément dans une direction
 * @param {HTMLElement} element - Element
 * @param {'next'|'previous'} direction - Suivant ou précédent
 * @returns {HTMLElement} Branche voisine
 */
function getBranchSibling(element, direction) {
  /** @type {HTMLElement} */
  const parentNode = element.parentNode;
  if (parentNode?.children.length === 1) {
    const nextToParent = direction === 'next' ? parentNode.nextElementSibling : parentNode.previousElementSibling;
    return nextToParent ? nextToParent : getBranchSibling(parentNode, direction);
  }
  return null;
}

export default NavigationUtilities;