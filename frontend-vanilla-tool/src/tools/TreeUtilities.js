class TreeUtilities {

  /**
   * Récupérer le noeud de l'arbre si l'élément se trouve dans un arbre
   * @param {HTMLElement} element : Element
   * @returns {HTMLElement} noeud
   */
  static getTreeElement(element) {
    if (element.getAttribute('role') === 'treeitem') {
      return element;
    }
    // Element peut contenir l'arbre comme il peut être une section de l'élément de l'arbre
    const group = element.querySelector('[role="group"]');
    // Si on ne trouve pas le group ou l'arbre, c'est que l'on est dans la section qui défini le noeud de l'arbre
    return group ? element.querySelector('[role="treeitem"]') : element.closest('[role="treeitem"]');
  }

  /**
   * Recherche l'élément enfant ou parent avec la classe demandée
   * Dans le cas d'un élément de l'arbre, si ll'enfant trouvé se trouve dans les enfants de l'arbre,
   * alors, on recherche dans les parents
   * @param {HTMLElement} element - Element
   * @param {string} className - Nom de la classe recherchée
   * @returns {HTMLElement} Element avec la classe demandée
   */
  static getTreeElementWithClass(element, className) {
    if (element === null) {
      return null;
    }
    if (element.classList.contains(className)) {
      return element;
    }
    const group = element.querySelector('[role="group"]');
    const childWithClass = element.querySelector(`.${ className }`);
    if (!childWithClass || group?.contains(childWithClass)) {
      /*
       * Si l'enfant est trouvé dans le groupe, alors ce n'est pas le composant de l'élément de l'arbre
       * mais un de ses enfants
       */
      return element.closest(`.${ className }`);
    }
    return childWithClass;
  }

  /**
   * Vérifier si l'élément se trouve dans un arbre
   * @param {HTMLElement} element
   * @returns {boolean}
   */
  static isTreeElement(element) {
    if (!element) {
      return false;
    }
    return this.getTreeElement(element) !== null;
  }

  /**
   * Vérifier si le noeud contenant l'élément est ouvert
   * @param {HTMLElement} element
   */
  static isOpened(element) {
    return this.getTreeElement(element)
      ?.getAttribute('aria-expanded') === 'true';
  }
  /**
   * Vérifier si le noeud contenant l'élément est fermé
   * @param {HTMLElement} element
   */
  static isClosed(element) {
    return this.getTreeElement(element)
      ?.getAttribute('aria-expanded') === 'false';
  }
  /**
   * Ouvrir le noeud contenant l'élément
   * @param {HTMLElement} element
   */
  static openNode(element) {
    this.getTreeElement(element)
      ?.setAttribute('aria-expanded', 'true');
  }
  /**
   * Fermer le noeud contenant l'item
   * @param {HTMLElement} element
   */
  static closeNode(element) {
    this.getTreeElement(element)
      ?.setAttribute('aria-expanded', 'false');
  }

  /**
   * Récupérer tous les éléments visibles de l'arbre
   * @param {HTMLElement} tree : Arbre
   * @returns {Array<HTMLElement>} liste des noeuds visibles
   */
  static getVisibleTreeItems(tree) {
    return TreeUtilities.filterVisibleElements([...tree.querySelectorAll('[role="treeitem"]')]);
  }
  static filterVisibleElements(elements) {
    return elements.filter(element => !element.closest('[aria-expanded="false"] [role="group"]') && !element.closest('.hidden'));
  }

  static getParent(element) {
    const group = element.closest('[role="group"]');
    return group?.closest('[role="treeitem"]');
  }

  static getFirstChild(element) {
    const group = element.querySelector('[role="group"]');
    return group?.firstElementChild;
  }
  static getLastChild(element) {
    const group = element.querySelector('[role="group"]');
    return group?.lastElementChild;
  }

  static isLastChild(element) {
    const group = element.closest('[role="group"]');
    return group?.lastElementChild.contains(element);
  }

  static getNextChild(element, direction) {
    const group = element.closest('[role="group"]');
    if (group) {
      const index = [...group.children].findIndex(child => child.contains(element));
      return direction === 'next' ? group.children[index + 1] : group.children[index - 1];
    }
    return null;
  }

  static getVerticalNextElement(treeItem, direction, givenClass) {
    const tree = this.getTree(treeItem);
    const visibleTreeItems = this.getVisibleTreeItems(tree);
    const index = visibleTreeItems.indexOf(treeItem);
    if (index > -1) {
      const nextTreeItem = direction === 'next' ? visibleTreeItems[index + 1] : visibleTreeItems[index - 1];
      if (nextTreeItem) {
        return this.getTreeElementWithClass(nextTreeItem, givenClass);
      }
    }
    return this.getNextTreeWithOrientation(treeItem, direction, 'vertical', givenClass);
  }

  static getHorizontalNextElement(treeItem, direction, givenClass) {
    /*
     * Si on va à droite, on ouvre le noeud fermé, si on va à gauche, on ferme le noeud ouvert
     * mais si le noeud est déjà dans l'état attendu, on se déplace vers l'arbre d'à côté
     */
    if (direction === 'next' && this.isClosed(treeItem)) {
      this.openNode(treeItem);
      return this.getTreeElementWithClass(treeItem, givenClass);
    }
    if (direction === 'prev' && this.isOpened(treeItem)) {
      this.closeNode(treeItem);
      return this.getTreeElementWithClass(treeItem, givenClass);
    }
    return this.getNextTreeWithOrientation(treeItem, direction, 'horizontal', givenClass);
  }

  static getNextTreeWithOrientation(treeItem, direction, orientation, givenClass) {
    const treeOrientation = getRootTreeListOrientation(treeItem);
    if (treeOrientation === orientation) {
      const nextTree = getNextTree(treeItem, direction);
      if (nextTree) {
        return this.getTreeElementWithClass(nextTree, givenClass);
      }
    }
    return null;
  }

  static getTree(element) {
    const treeList = element.closest('[role="tree"]');
    if (treeList) {
      return [...treeList.children].find(child => child.contains(element));
    }
    return null;
  }

}
/**
 * Donne l'orientation des arbres racines
 * @param {HTMLElement} treeItem - élément d'un arbre
 * @returns {'vertical'|'horizontal'|null} orientation
 */
function getRootTreeListOrientation(treeItem) {
  const treeList = treeItem.closest('[role="tree"]');
  if (!treeList) {
    return null;
  }
  return treeList.getAttribute('aria-orientation');
}
/**
 * Récupère le prochain arbre
 * @param {HTMLElement} element - élément d'un arbre
 * @param {'next'|'previous'} direction - Suivant ou précédent
 * @returns {HTMLElement} Arbre suivant
 */
function getNextTree(element, direction) {
  const treeList = element.closest('[role="tree"]');
  if (treeList) {
    const index = [...treeList.children].findIndex(child => child.contains(element));
    return direction === 'next' ? treeList.children[index + 1] : treeList.children[index - 1];
  }
  return null;
}

export default TreeUtilities;