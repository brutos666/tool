
import DOMUtilities from '../../tools/DOMUtilities.js';
import TreeView from '../decorators/views/TreeView.js';
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
    const parent = this.getParentView();
    if (parent instanceof TreeView) {
      return parent;
    }
    return false;
  }

  /*
   * Vues et élément pouvant prendre le focus par les touches du clavier ou un clic de la souris
   * -------------------------------------------------------------------------------------------
   */
  removeAllFocusableViews() {
    this.giveControlToFocusManager(this.getRootFocusManager());

    super.removeAllFocusableViews();
  }

  /*
   * Prise de focus
   * ---------------
   */
  giveFocusTo(treeView) {
    this.setCurrentWithIndex(this.getFocusableViews()
      .indexOf(treeView));
    super.giveFocus();
  }
  giveFocusToLast() {
    this.setCurrentWithIndex(this.getFocusableViews().length - 1);
    super.giveFocus();
  }
  giveFocusToFirst() {
    this.setCurrentWithIndex(0);
    super.giveFocus();
  }
  giveFocusToNext() {
    const index = this.getIndexCurrent() + 1;
    if (index < this.getFocusableViews().length) {
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
    /**  @type {TreeView} */
    const currentView = this.getCurrentView();

    if (currentView.isClosed()) {
      currentView.setOpen(true);
    } else if (currentView.isLeaf()) {
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
    } else if (currentView.isOpened()) {
      // Donne la gestion du focus sur la liste des arbres/feuilles enfants du noeud
      const childFocusManager = this.giveControlToChild(currentView);
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
    /**  @type {TreeView} */
    const currentView = this.getCurrentView();

    if (currentView.isOpened()) {
      currentView.setOpen(false);
    } else if (this.hasParentTree()) {
      const parentFocusManager = this.giveControlToParentTree();
      parentFocusManager.giveFocus();
    } else {
      super.focusToDirection('Left');
    }
  }

  reactToDown() {
    /**  @type {TreeView} */
    const currentView = this.getCurrentView();
    // Si le noeud courant est ouvert, on doit aller au 1er enfant
    if (currentView.isOpened()) {
      const childFocusManager = this.giveControlToChild(currentView);
      childFocusManager.giveFocusToFirst();
      return;
    }
    // Si on est sur le dernier élément de la liste, on doit donner le contrôle au parent
    const indexCurrent = this.getIndexCurrent();
    if (indexCurrent === this.getFocusableViews().length - 1 && this.hasParentTree()) {
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

    /**  @type {TreeView} */
    const currentView = this.getCurrentView();
    // Si le nouveau noeud courant est ouvert, on doit aller au dernier enfant
    if (!currentView.isOpened()) {
      return;
    }

    const childFocusManager = this.giveControlToChild(currentView);
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
    if (indexCurrent >= 0 && indexCurrent < this.getFocusableViews().length) {
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

    if (DOMUtilities.isHidden(this.getContainer()) || this.getFocusableViews().length === 0) {
      return;
    }

    /**  @type {TreeView} */
    const currentView = this.getCurrentView();
    // Element de l'arbre
    let childFocusManager = currentView.getFocusManager();
    childFocusManager?.stopAllListenKeys();

    // Liste des enfants
    childFocusManager = currentView.getStaticView('treeList')
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
   * @param {TreeView} view : vue ayant le focus
   * @returns {TreeFocusManager} focusManager enfant
   */
  giveControlToChild(view) {
    const childFocusManager = view.getStaticView('treeList')
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
    return this.getParentView()
      .getParentView()
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