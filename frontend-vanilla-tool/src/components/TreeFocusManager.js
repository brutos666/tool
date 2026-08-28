
import DOMUtilities from '../tools/DOMUtilities.js';
import Tree from './decorators/Tree.js';
import DragDropFocusManager from './DragDropFocusManager.js';
/** @import Component from './Component.js'; */

class TreeFocusManager extends DragDropFocusManager {

  name = 'TreeFocusManager';

  /**
   * @constructor
   * @param {HTMLElement} container : conteneur des listes d'arbre
   * @param {'horizontal'|'vertical'} orientation : déplacement horizontal ou vertical
   * @param {boolean} enterToAccess : traite la possibilité d'entrer dans un élément pour naviguer à l'intérieur
   */
  constructor(container, orientation, enterToAccess) {
    super(container, orientation, enterToAccess);
  }
  /** @override */
  allowFocusToDisabled() {
    return true;
  }

  hasFocusableParent() {
    const parent = this.getParentComponent();
    if (parent instanceof Tree) {
      return parent.getParent();
    }
    return false;
  }

  /** @override */
  isCurrentHasFocused() {
    const isFocused = super.isCurrentHasFocused();
    if (isFocused) {
      return true;
    }
    const childFocusManager = this.getInsideFocusManager();
    return childFocusManager?.isCurrentHasFocused();
  }

  /**
   * Retourne l'arbre même si on est sur un placeholder
   * @returns {Tree}
   */
  getCurrentTree() {
    const current = this.getCurrent();
    return super.isPlaceholder(current) ? this.getComponentWithPlaceholder(current) : current;
  }

  /*
   * Prise de focus
   * ---------------------------------------------------
   */
  giveFocusToFirst() {
    const rootFocusManager = this.getRootFocusManager();
    this.giveControlToFocusManager(rootFocusManager);
    rootFocusManager.giveFocusToFirstNode();
  }
  giveFocusToLast() {
    const rootFocusManager = this.getRootFocusManager();
    this.giveControlToFocusManager(rootFocusManager);
    rootFocusManager.giveFocusToLastLeaf();
  }

  giveFocusToFirstNode() {
    const firstFocusable = this.getFirstFocusable();
    if (!firstFocusable) {
      return;
    }
    this.giveFocusTo(firstFocusable);
  }
  /**
   * Parcours la totalité de l'arbre pour donner le focus au dernier élément de l'arbre
   */
  giveFocusToLastLeaf() {
    const lastFocusable = this.getLastFocusable();
    if (!lastFocusable) {
      return;
    }
    this.setCurrent(lastFocusable);
    const childFocusManager = this.giveControlToChild();
    if (childFocusManager) {
      childFocusManager.giveFocusToLastLeaf();
    } else {
      // Si, pour le noeud courant, rien est accessible, on se positionne sur le noeud courant
      this.giveFocus();
    }
  }

  giveFocusToPrevTree() {
    const rootFocusManager = this.getRootFocusManager();
    if (!rootFocusManager.isHorizontal()) {
      return;
    }
    const indexCurrent = rootFocusManager.getIndexCurrent();
    const nextFocusable = rootFocusManager.getLastFocusableBefore(indexCurrent);
    if (!nextFocusable) {
      return;
    }
    this.giveControlToFocusManager(rootFocusManager);
    // Se positionner sur le premier accessible après le noeud courant
    rootFocusManager.giveFocusTo(nextFocusable);
  }
  giveFocusToNextTree() {
    const rootFocusManager = this.getRootFocusManager();
    if (!rootFocusManager.isHorizontal()) {
      return;
    }
    const indexCurrent = rootFocusManager.getIndexCurrent();
    const nextFocusable = rootFocusManager.getFirstFocusableAfter(indexCurrent);
    if (!nextFocusable) {
      return;
    }
    this.giveControlToFocusManager(rootFocusManager);
    // Se positionner sur le premier accessible après le noeud courant
    rootFocusManager.giveFocusTo(nextFocusable);
  }

  /*
   * Vues et élément pouvant prendre le focus par les touches du clavier ou un clic de la souris
   * -------------------------------------------------------------------------------------------
   */
  /** @override */
  removeAllComponents() {
    this.giveControlToFocusManager(this.getRootFocusManager());

    super.removeAllComponents();
  }

  /*
   * Navigation au clavier
   * ---------------------
   */
  /** @override */
  interceptKeys() {
    const keys = [ 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown' ];
    if (super.canEnter()) {
      keys.push('Enter');
    }
    return keys;
  }

  /** @override */
  focusToDirection(direction) {
    if (direction === 'Right') {
      this.reactToRightKey();
    } else if (direction === 'Left') {
      this.reactToLeftKey();
    } else if (direction === 'Down') {
      this.reactToDown();
    } else if (direction === 'Up') {
      this.reactToUp();
    }
  }
  /**
   * Lors de l'appui sur la touche pour aller à droite :
   * - si on est sur un noeud fermé, on ouvre le noeud
   * - si on est sur une feuille, on se déplace dans la liste (la liste peut être horizontale)
   * - si on est sur noeud déjà ouvert, on se positionne sur la liste enfant du noeud
   *
   * > la gestion du focus se faisant liste d'arbre par liste d'arbre, le passage sur l'enfant se fait en désactivant l'écoute des touches du clavier et en activant celle de la liste enfant
   */
  reactToRightKey() {
    const current = this.getCurrent();
    if (isTree(current) && current.isClosed()) {
      current.openNode();
      return;
    }
    // S'il y a des éléments enfants accessibles, on se positionne sur le 1er accessible
    const childFocusManager = this.giveControlToChild();
    if (childFocusManager) {
      childFocusManager.giveFocusToFirstNode();
      return;
    }

    // Pour une navigation verticale, la possibilité d'aller à droite peut être donné par la racine à condition que cette dernière soit une navigation horizontale
    this.giveFocusToNextTree();
  }

  /**
   * Lors de l'appui sur la touche pour aller à gauche :
   * - si on est sur un noeud ouvert, on ferme le noeud
   * - si on est sur noeud déjà fermé
   *    x le noeud est dans un arbre, on se positionne sur le noeud parent
   *    x le noeud est à la racine, on se déplace dans la liste (la liste peut être horizontale)
   *
   * > la gestion du focus se faisant liste d'arbre par liste d'arbre, le passage sur le parent se fait en désactivant l'écoute des touches du clavier et en activant celle de la liste parente
   */
  reactToLeftKey() {
    const current = this.getCurrent();
    if (isTree(current) && current.isOpened()) {
      current.closeNode();
      return;
    }

    if (this.hasFocusableParent()) {
      const parentFocusManager = this.giveControlToParentTree();
      parentFocusManager.giveFocus();
      return;
    }
    // Pour une navigation verticale, la possibilité d'aller à gauche peut être donné par la racine à condition que cette dernière soit une navigation horizontale
    this.giveFocusToPrevTree();
  }

  reactToDown() {
    const childFocusManager = this.giveControlToChild();
    if (childFocusManager) {
      // Se positionner sur le 1er accessible à l'intérieur du noeud courant
      childFocusManager.giveFocusToFirstNode();
      return;
    }
    const indexCurrent = this.getIndexCurrent();
    const nextFocusable = this.getFirstFocusableAfter(indexCurrent);
    if (nextFocusable) {
      // Se positionner sur le premier accessible après le noeud courant
      this.giveFocusTo(nextFocusable);
      return;
    }

    // Si on est sur le dernier élément accessible de la liste, on doit donner le contrôle au parent
    if (!this.hasFocusableParent()) {
      return;
    }
    /*
     * Se positionner sur le parent du noeud courant puis sur le 1er suivant accessible
     * NOTE : donner le contrôle à un focusManager ajoute les placeholder en cas de drag&drop.
     * Si on veut bien se placer sur le placeholder suivant, il faut donner le contrôle.
     */
    const parentFocusManager = this.giveControlToParentTree();
    const nextParentFocusable = parentFocusManager.getFirstFocusableAfter(parentFocusManager.getIndexCurrent());
    if (!nextParentFocusable) {
      parentFocusManager.giveControlToFocusManager(this);
      return;
    }

    // Se positionner sur le premier accessible après le noeud courant
    parentFocusManager.giveFocusTo(nextParentFocusable);
  }

  reactToUp() {
    const indexCurrent = this.getIndexCurrent();
    const lastFocusableBefore = this.getLastFocusableBefore(indexCurrent);
    if (lastFocusableBefore) {
      this.setCurrent(lastFocusableBefore);
      const childFocusManager = this.giveControlToChild();
      if (childFocusManager) {
        childFocusManager.giveFocusToLastLeaf();
      } else {
        // Si, pour le noeud courant, rien est accessible, on se positionne sur le noeud courant
        this.giveFocus();
      }
      return;
    }
    // Si on est sur le dernier élément de la liste, on doit donner le contrôle au parent
    if (this.hasFocusableParent()) {
      const parentFocusManager = this.giveControlToParentTree();
      parentFocusManager.giveFocus();
    }
  }

  /*
   * Démarrage/Arrêt de la navigation au clavier
   * --------------------------------------------------
   */
  /** @override */
  disableNavigationForAll() {
    super.disableNavigationForAll();

    /**  @type {Tree} */
    const currentTree = this.getCurrentTree();

    if (DOMUtilities.isHidden(this.getContainer()) || this.getAllComponents().length === 0 || !currentTree) {
      return;
    }

    // Liste des enfants
    const childFocusManager = this.getInsideFocusManager();
    if (childFocusManager && childFocusManager !== this) {
      childFocusManager.disableNavigationForAll();
    }
  }
  /** @override */
  hasNavigationActive() {
    if (super.hasNavigationActive()) {
      return true;
    }
    const childFocusManager = this.getInsideFocusManager();
    return childFocusManager?.hasNavigationActive();
  }
  /*
   * Gestion du contrôle de la navigation
   * ---------------------------------------------------
   */
  /**
   * Donne le contrôle au focusManager enfant d'une vue à condition qu'il y ait des composants pouvant prendre le focus
   * @returns {TreeFocusManager} focusManager enfant ou null si pas de composants pouvant avoir le focus
   */
  giveControlToChild() {
    const childFocusManager = this.getInsideFocusManager();
    if (!childFocusManager || !childFocusManager.getFirstFocusable()) {
      return null;
    }
    this.giveControlToFocusManager(childFocusManager);
    return childFocusManager;
  }

  /**
   * Retourne le focusManager parent
   * @returns {TreeFocusManager} focusManager parent
   */
  getParentTreeFocusManager() {
    if (!this.hasFocusableParent()) {
      return null;
    }
    return this.getParentComponent()
      .getParent()
      .getFocusManager();
  }
  /** @override */
  getParentFocusManager() {
    return this.getParentTreeFocusManager();
  }
  /** @override */
  getActiveFocusManager() {
    const activeFocusManager = super.getActiveFocusManager();
    if (activeFocusManager) {
      return activeFocusManager;
    }
    const treeChildFocusManager = this.getInsideFocusManager();
    return treeChildFocusManager?.getActiveFocusManager();
  }
  /** @override */
  getInsideFocusManager() {
    const currentTree = this.getCurrentTree();
    if (!currentTree) {
      return null;
    }
    const treeListChild = currentTree.getStaticChild('treeList');
    if (!treeListChild) {
      return null;
    }
    return treeListChild.getFocusManager();
  }

  /**
   * Donne le contrôle au focusManager de la liste des arbres parente
   * @returns {FocusManager} focusManager parent
   */
  giveControlToParentTree() {
    const parentFocusManager = this.getParentTreeFocusManager();
    this.giveControlToFocusManager(parentFocusManager);
    return parentFocusManager;
  }

}
/**
 * Indique si le composant est un arbre (Tree)
 * @param {Component} component - Composant
 */
function isTree(component) {
  return component.getName() === 'Tree';
}

export default TreeFocusManager;