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
    return element.querySelector('[role="treeitem"]') || element.closest('[role="treeitem"]');
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

  static filterVisibleElements(elements) {
    return elements.filter(element => !element.closest('[aria-expanded="false"] .tree__list') && !element.closest('.hidden'));
  }

  static getParent(element) {
    const group = element.closest('[role="group"]');
    return group?.previousElementSibling;
  }

  static getLastChild(element) {
    const group = element.querySelector('[role="group"]');
    return group?.lastElementChild;
  }

}

export default TreeUtilities;