
import DOMUtilities from '../tools/DOMUtilities.js';
import Tree from './decorators/Tree.js';
import FocusManager from './FocusManager.js';

class TreeFocusManager extends FocusManager {

  name = 'TreeFocusManager';

  /**
   * @constructor
   * @param {HTMLElement} container : conteneur des listes d'arbre
   * @param {'horizontal'|'vertical'} orientation : déplacement horizontal ou vertical
   * @param {boolean} enterToAccess : traite la possibilité d'entrer dans un élément pour naviguer à l'intérieur
   */
  constructor(container, orientation, enterToAccess) {
    super(container, orientation, false, enterToAccess);
  }

  hasFocusableParent() {
    const parent = this.getParentComponent();
    if (parent instanceof Tree) {
      return parent.getParent();
    }
    return false;
  }

  isCurrentHasFocused() {
    const isFocused = super.isCurrentHasFocused();
    if (isFocused) {
      return true;
    }
    const childFocusManager = this.getCurrent()
      ?.getStaticChild('treeList')
      .getFocusManager();
    return childFocusManager?.isCurrentHasFocused();
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
    this.setCurrent(firstFocusable);
    this.giveFocus();
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
    const childFocusManager = this.giveControlToChild(this.getCurrent());
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
    rootFocusManager.setCurrent(nextFocusable);
    rootFocusManager.giveFocus();
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
    rootFocusManager.setCurrent(nextFocusable);
    rootFocusManager.giveFocus();
  }
  isFocusable(component) {
    // Le choix a été fait de pouvoir naviguer dans un arbre inaccessible
    return !component.isHidden() && !DOMUtilities.isHidden(component.getElementView()) && this.getAllComponents()
      .includes(component);
  }
  /*
   * Vues et élément pouvant prendre le focus par les touches du clavier ou un clic de la souris
   * -------------------------------------------------------------------------------------------
   */
  removeAllComponents() {
    this.giveControlToFocusManager(this.getRootFocusManager());

    super.removeAllComponents();
  }

  /*
   * Navigation au clavier
   * ---------------------
   */
  interceptKeys() {
    const keys = [ 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown' ];
    if (super.canEnter()) {
      keys.push('Enter');
    }
    return keys;
  }

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
    /**  @type {Tree} */
    const current = this.getCurrent();

    if (current.isClosed()) {
      current.openNode();
      return;
    }
    // S'il y a des éléments enfants accessibles, on se positionne sur le 1er accessible
    const childFocusManager = this.giveControlToChild(current);
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
    /**  @type {Tree} */
    const current = this.getCurrent();

    if (current.isOpened()) {
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
    /**  @type {Tree} */
    const current = this.getCurrent();
    const childFocusManager = this.giveControlToChild(current);
    if (childFocusManager) {
      // Se positionner sur le 1er accessible à l'intérieur du noeud courant
      childFocusManager.giveFocusToFirstNode();
      return;
    }
    const indexCurrent = this.getIndexCurrent();
    const nextFocusable = this.getFirstFocusableAfter(indexCurrent);
    if (nextFocusable) {
      // Se positionner sur le premier accessible après le noeud courant
      this.setCurrent(nextFocusable);
      this.giveFocus();
      return;
    }

    // Si on est sur le dernier élément accessible de la liste, on doit donner le contrôle au parent
    if (!this.hasFocusableParent()) {
      return;
    }
    // Se positionner sur le parent du noeud courant puis sur le 1er suivant accessible
    const parentFocusManager = this.getParentTreeFocusManager();
    const nextParentFocusable = parentFocusManager.getFirstFocusableAfter(parentFocusManager.getIndexCurrent());
    if (!nextParentFocusable) {
      return;
    }
    // Se positionner sur le premier accessible après le noeud courant
    this.giveControlToFocusManager(parentFocusManager);
    parentFocusManager.setCurrent(nextParentFocusable);
    parentFocusManager.giveFocus();
  }

  reactToUp() {
    const indexCurrent = this.getIndexCurrent();
    const lastFocusableBefore = this.getLastFocusableBefore(indexCurrent);
    if (lastFocusableBefore) {
      this.setCurrent(lastFocusableBefore);
      const childFocusManager = this.giveControlToChild(this.getCurrent());
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
  disableNavigationForAll() {
    this.disableKeyNavigation();

    /**  @type {Tree} */
    const current = this.getCurrent();

    if (DOMUtilities.isHidden(this.getContainer()) || this.getAllComponents().length === 0 || !current) {
      return;
    }
    // Element de l'arbre
    let childFocusManager = current.getFocusManager();
    childFocusManager?.disableNavigationForAll();

    // Liste des enfants
    childFocusManager = current.getStaticChild('treeList')
      .getFocusManager();
    if (childFocusManager && childFocusManager !== this) {
      childFocusManager.disableNavigationForAll();
    }
  }
  hasNavigationActive() {
    if (super.hasNavigationActive()) {
      return true;
    }
    const childFocusManager = this.getCurrent()
      ?.getStaticChild('treeList')
      .getFocusManager();
    return childFocusManager?.hasNavigationActive();
  }
  /*
   * Gestion du contrôle de la navigation
   * ---------------------------------------------------
   */
  /**
   * Donne le contrôle au focusManager enfant d'une vue à condition qu'il y ait des composants pouvant prendre le focus
   * @param {Tree} component : vue ayant le focus
   * @returns {TreeFocusManager} focusManager enfant ou null si pas de composants pouvant avoir le focus
   */
  giveControlToChild(component) {
    const childFocusManager = component.getStaticChild('treeList')
      .getFocusManager();
    if (!childFocusManager.getFirstFocusable()) {
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
  getParentFocusManager() {
    return this.getParentTreeFocusManager();
  }
  getActiveFocusManager() {
    const activeFocusManager = super.getActiveFocusManager();
    if (activeFocusManager) {
      return activeFocusManager;
    }
    const treeChildFocusManager = this.getCurrent()
      ?.getStaticChild('treeList')
      .getFocusManager();
    return treeChildFocusManager?.getActiveFocusManager();
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

export default TreeFocusManager;