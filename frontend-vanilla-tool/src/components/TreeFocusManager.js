
import DOMUtilities from '../tools/DOMUtilities.js';
import Tree from './decorators/Tree.js';
import FocusManager from './FocusManager.js';

class TreeFocusManager extends FocusManager {

  /**
   * @constructor
   * @param {HTMLElement} container : conteneur des listes d'arbre
   * @param {'horizontal'|'vertical'} orientation : déplacement horizontal ou vertical
   * @param {boolean} enterToAccess : traite la possibilité d'entrer dans un élément pour naviguer à l'intérieur
   */
  constructor(container, orientation, enterToAccess) {
    super(container, orientation, false, enterToAccess);
  }

  hasParentTree() {
    const parent = this.getParentComponent();
    if (parent instanceof Tree) {
      return parent;
    }
    return false;
  }

  /*
   * Vues et élément pouvant prendre le focus par les touches du clavier ou un clic de la souris
   * -------------------------------------------------------------------------------------------
   */
  removeAllFocusable() {
    this.giveControlToFocusManager(this.getRootFocusManager());

    super.removeAllFocusable();
  }

  /*
   * Prise de focus
   * ---------------
   */
  giveFocusTo(tree) {
    this.setCurrentWithIndex(this.getFocusable()
      .indexOf(tree));
    super.giveFocus();
  }
  giveFocusToLast() {
    this.setCurrentWithIndex(this.getFocusable().length - 1);
    super.giveFocus();
  }
  giveFocusToFirst() {
    this.setCurrentWithIndex(0);
    super.giveFocus();
  }
  giveFocusToNext() {
    const index = this.getIndexCurrent() + 1;
    if (index < this.getFocusable().length) {
      this.setCurrentWithIndex(index);
      super.giveFocus();
    }
  }
  giveFocusToPrev() {
    const index = this.getIndexCurrent() - 1;
    if (index > -1) {
      this.setCurrentWithIndex(index);
      super.giveFocus();
    }
  }

  /*
   * Navigation au clavier
   * ---------------------
   */
  interceptKeys() {
    if (DOMUtilities.isHidden(this.getCurrent())) {
      return [];
    }
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
    const current = this.getCurrentComponent();

    if (current.isClosed()) {
      current.setOpen(true);
    } else if (current.isLeaf()) {
      // Pour une navigation verticale, la possibilité d'aller à droite peut être donné par la racine à condition que cette dernière est une navigation horizontale
      if (this.isHorizontal()) {
        super.focusToDirection('Right');
      } else {
        const rootFocusManager = this.getRootFocusManager();
        if (rootFocusManager?.isHorizontal()) {
          this.giveControlToFocusManager(rootFocusManager);
          rootFocusManager.giveFocusToNext();
        }
      }
    } else if (current.isOpened()) {
      // Donne la gestion du focus sur la liste des arbres/feuilles enfants du noeud
      const childFocusManager = this.giveControlToChild(current);
      childFocusManager.giveFocusToFirst();
    }
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
    const current = this.getCurrentComponent();

    if (current.isOpened()) {
      current.setOpen(false);
    } else if (this.hasParentTree()) {
      const parentFocusManager = this.giveControlToParentTree();
      parentFocusManager.giveFocus();
    } else {
      super.focusToDirection('Left');
    }
  }

  reactToDown() {
    /**  @type {Tree} */
    const current = this.getCurrentComponent();
    // Si le noeud courant est ouvert, on doit aller au 1er enfant
    if (current.isOpened()) {
      const childFocusManager = this.giveControlToChild(current);
      childFocusManager.giveFocusToFirst();
      return;
    }
    // Si on est sur le dernier élément de la liste, on doit donner le contrôle au parent
    const indexCurrent = this.getIndexCurrent();
    if (indexCurrent === this.getFocusable().length - 1 && this.hasParentTree()) {
      const parentFocusManager = this.giveControlToParentTree();
      parentFocusManager.giveFocus();
      parentFocusManager.moveVertically('Down');
      return;
    }
    super.focusToDirection('Down');
  }

  reactToUp() {
    // Si on est sur le dernier élément de la liste, on doit donner le contrôle au parent
    const indexCurrent = this.getIndexCurrent();
    if (indexCurrent === 0 && this.hasParentTree()) {
      const parentFocusManager = this.giveControlToParentTree();
      parentFocusManager.giveFocus();
      return;
    }

    super.focusToDirection('Up');

    /**  @type {Tree} */
    const current = this.getCurrentComponent();
    // Si le nouveau noeud courant est ouvert, on doit aller au dernier enfant
    if (!current.isOpened()) {
      return;
    }

    const childFocusManager = this.giveControlToChild(current);
    childFocusManager.giveFocusToLast();
  }

  /**
   * Le déplacement verticale est un déplacement proche en proche qui prend en compte les noeuds ouverts.
   * Il faut s'appliquer à trouver le bon focusManager qui prend la main lorsque l'on quitte la liste courante
   * @param {'Up'|'Down'} direction
   */
  moveVertically(direction) {
    if (!this.hasParentTree()) {
      super.focusToDirection(direction);
      return;
    }
    const indexCurrent = this.getIndexCurrent() + (direction === 'Up' ? -1 : 1);
    if (indexCurrent >= 0 && indexCurrent < this.getFocusable().length) {
      super.focusToDirection(direction);
      return;
    }
    // Dans tous les cas, la liste parente doit reprendre le contrôle
    const parentFocusManager = this.giveControlToParentTree();
    parentFocusManager.giveFocus();
    parentFocusManager.focusToDirection(direction);
  }

  /*
   * Démarrage/Arrêt de la navigation au clavier
   * --------------------------------------------------
   */
  stopAllListenKeys() {
    this.stopListenKeys();

    if (DOMUtilities.isHidden(this.getContainer()) || this.getFocusable().length === 0) {
      return;
    }

    /**  @type {Tree} */
    const current = this.getCurrentComponent();
    // Element de l'arbre
    let childFocusManager = current.getFocusManager();
    childFocusManager?.stopAllListenKeys();

    // Liste des enfants
    childFocusManager = current.getStaticChild('treeList')
      .getFocusManager();
    if (childFocusManager && childFocusManager !== this) {
      childFocusManager.stopAllListenKeys();
    }
  }
  /*
   * Gestion du contrôle de la navigation
   * ---------------------------------------------------
   */
  /**
   * Donne le contrôle au focusManager enfant d'une vue
   * @param {Tree} component : vue ayant le focus
   * @returns {TreeFocusManager} focusManager enfant
   */
  giveControlToChild(component) {
    const childFocusManager = component.getStaticChild('treeList')
      .getFocusManager();
    this.giveControlToFocusManager(childFocusManager);
    childFocusManager.giveFocus();
    return childFocusManager;
  }

  /**
   * Retourne le focusManager parent
   * @returns {TreeFocusManager} focusManager parent
   */
  getParentTreeFocusManager() {
    if (!this.hasParentTree()) {
      return null;
    }
    return this.getParentComponent()
      .getParent()
      .getFocusManager();
  }
  getParentFocusManager() {
    return this.getParentTreeFocusManager();
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