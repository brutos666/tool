
import DOMUtilities from '../../tools/DOMUtilities.js';
import TreeView from '../decorators/views/TreeView.js';
import FocusManager from './FocusManager.js';

class TreeFocusManager extends FocusManager {

  /** @type {TreeView} */
  #parentTree;

  #TREE_SELECTOR = '.tree';

  #onMouseDownEvent = this.onMouseDown.bind(this);

  #keyNavigationInProgress = false;

  /**
   * @constructor
   * @param {HTMLElement} container : conteneur des listes d'arbre
   * @param {'horizontal'|'vertical'} orientation : déplacement horizontal ou vertical
   * @param {boolean} canEnter : traite la possibilité d'entrer dans un élément pour naviguer à l'intérieur
   */
  constructor(container, orientation, canEnter) {
    super(container, orientation, false, canEnter);
  }

  /**
   * Positionne le parent des arbres. Utile lorsqu'il s'agit d'un arbre
   * @param {View} parent : parent des arbres
   */
  setParent(parent) {
    if (parent instanceof TreeView) {
      this.#parentTree = parent;
    }
  }
  hasParentTree() {
    return !!this.#parentTree;
  }

  /**
   * Ajout d'un élément focusable
   * @param {View} view
   * @param {string|undefined} selector : sélecteur facultatif pour spécifier un sous-élément
   */
  addFocusableView(view, selector) {
    super.addFocusableView(view, selector);

    view.getElementView()
      .addEventListener('mousedown', this.#onMouseDownEvent);
  }
  removeFocusableView(index) {
    this.getFocusableViewAt(index)
      .getElementView()
      .removeEventListener('mousedown', this.#onMouseDownEvent);

    super.removeFocusableView(index);
  }
  removeAllFocusableViews() {
    for (const focusableView of this.getFocusableViews()) {
      focusableView.getElementView()
        .removeEventListener('mousedown', this.#onMouseDownEvent);
    }
    this.giveControlToFocusManager(this.getRootFocusManager());

    super.removeAllFocusableViews();
  }

  onBlur(event) {
    super.onBlur(event);

    if (!this.isListened() || this.#keyNavigationInProgress) {
      return;
    }
    const relatedTargetTree = event.relatedTarget?.closest(this.#TREE_SELECTOR);
    if (relatedTargetTree === event.currentTarget) {
      return;
    }
    // L'arrêt ne doit pas se faire si on quitte le composant de navigation dans les arbres (il faut pouvoir revenir dessus via la tabulation au clavier)
    const targetTree = event.target.closest(this.#TREE_SELECTOR);
    if (targetTree === event.currentTarget && this.isInSameTrees(relatedTargetTree)) {
      this.stopListenKeys();
    }
  }

  onMouseDown(event) {
    this.stopListenKeys();
    this.setCurrent(event.currentTarget);
    // L'écoute des touches du clavier ne doit se faire que sur la liste d'arbres directe (pas les noeuds parents)
    if (event.target.closest(this.#TREE_SELECTOR) === event.currentTarget) {
      this.listenKeys();
    }
  }

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

  interceptKeys() {
    if (DOMUtilities.isHidden(this.getCurrent())) {
      return [];
    }
    if (this.isEnter()) {
      return ['Escape'];
    }

    const keys = [ 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown' ];
    if (super.isCanEnter()) {
      keys.push('Enter');
    }
    return keys;
  }

  focusToDirection(direction) {
    this.#keyNavigationInProgress = true;
    if (direction === 'Right') {
      this.reactToRightKey();
    } else if (direction === 'Left') {
      this.reactToLeftKey();
    } else if (direction === 'Down') {
      this.reactToDown();
    } else if (direction === 'Up') {
      this.reactToUp();
    }
    this.#keyNavigationInProgress = false;
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
    } else if (this.#parentTree) {
      const parentFocusManager = this.giveControlToParent();
      parentFocusManager.giveFocusTo(this.#parentTree);
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
    if (indexCurrent === this.getFocusableViews().length - 1 && this.#parentTree) {
      const parentFocusManager = this.giveControlToParent();
      parentFocusManager.moveVertically('Down');
      return;
    }
    super.focusToDirection('Down');
  }

  reactToUp() {
    // Si on est sur le dernier élément de la liste, on doit donner le contrôle au parent
    const indexCurrent = this.getIndexCurrent();
    if (indexCurrent === 0 && this.#parentTree) {
      const parentFocusManager = this.giveControlToParent();
      parentFocusManager.giveFocusTo(this.#parentTree);
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
   * Donne le contrôle au focusManager enfant
   * @param {TreeView} currentView : vue ayant le focus
   * @returns {TreeFocusManager} focusManager enfant
   */
  giveControlToChild(currentView) {
    const childFocusManager = currentView.getStaticView('treeList')
      .getFocusManager();
    this.giveControlToFocusManager(childFocusManager);
    childFocusManager.giveFocus();
    return childFocusManager;
  }
  /**
   * Donne le contrôle au focusManager parent
   * @returns {TreeFocusManager} focusManager parent
   */
  giveControlToParent() {
    const parentFocusManager = this.getParentFocusManager();
    this.giveControlToFocusManager(parentFocusManager);
    parentFocusManager.giveFocusTo(this.#parentTree);
    return parentFocusManager;
  }

  /**
   * Donne le contrôle au focusManager précisé en entrée
   * @param {TreeFocusManager} focusManager
   */
  giveControlToFocusManager(focusManager) {
    this.stopListenKeys();
    // Astuce pour l'écoute de la touche en cours d'appui ne soit pas pris en comte
    setTimeout(() => {
      focusManager.listenKeys();
    }, 0);
  }

  /**
   * Retourne le focusManager parent
   * @returns {TreeFocusManager} focusManager parent
   */
  getParentFocusManager() {
    return this.#parentTree?.getParentView()
      .getFocusManager();
  }
  /**
   * Retourne le focusManager racine
   * @returns {TreeFocusManager} focusManager racine
   */
  getRootFocusManager() {
    const parent = this.getParentFocusManager();
    if (parent) {
      return parent.getRootFocusManager();
    }
    return this;
  }

  /**
   * Recherche si l'élément se trouve parmi les mêmes arbres de navigation que ceux géré par la classe
   * @param {HTMLElement} element - Element
   * @returns true si l'élément se trouve parmi les arbres de navigation
   */
  isInSameTrees(element) {
    if (!element) {
      return false;
    }
    return this.getRootFocusManager()
      .getContainer()
      .contains(element);
  }

  /**
   * Le déplacement verticale est un déplacement proche en proche qui prend en compte les noeuds ouverts.
   * Il faut s'appliquer à trouver le bon focusManager qui prend la main lorsque l'on quitte la liste courante
   * @param {'Up'|'Down'} direction
   */
  moveVertically(direction) {
    if (!this.#parentTree) {
      super.focusToDirection(direction);
      return;
    }
    const indexCurrent = this.getIndexCurrent() + (direction === 'Up' ? -1 : 1);
    if (indexCurrent >= 0 && indexCurrent < this.getFocusableViews().length) {
      super.focusToDirection(direction);
      return;
    }
    // Dans tous les cas, la liste parente doit reprendre le contrôle
    const parentFocusManager = this.giveControlToParent();
    parentFocusManager.focusToDirection(direction);
  }

}

export default TreeFocusManager;