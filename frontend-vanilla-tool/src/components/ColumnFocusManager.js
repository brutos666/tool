import DragDropFocusManager from './DragDropFocusManager.js';
/** @import Component from './Component.js'; */

class ColumnFocusManager extends DragDropFocusManager {

  name = 'ColumnFocusManager';
  /**
   * @typedef {Object} Position - Informations sur l'item
   * @property {number} columnIndex - Index de la colonne
   * @property {number} rowIndex - Index du composant dans la colonne (prise en compte des composants enfants)
   */
  /**
   * @typedef {Object} Cell - Informations sur l'item
   * @property {Component} component - Composant
   * @property {boolean} focusable - Est-ce que le composant peut avoir le focus
   */

  /** @type {Component} */
  #header;
  /** @type {Array<Array<Component>>} */
  #columns = [];
  /**
   * @constructor
   * @param {HTMLElement} container : conteneur des listes d'arbre
   */
  constructor(container) {
    // Navigation horizontal pour aller d'une colonne à l'autre, verticale dans la colonne
    super(container, 'horizontal', false, false);
  }
  /** @override */
  allowFocusToDisabled() {
    return true;
  }
  /** @override */
  isControlChildNavigation() {
    // Indique que le système de navigation des enfants (hors accès avec touche Entrée) est géré ici
    return true;
  }
  /*
   * Titre ou header
   * -------------------------------------------------------------------------------------------
   */
  setHeader(component) {
    this.#header = component;
    this.addComponent(this.#header);
  }

  /*
   * Colonnes contenant les composants pouvant prendre le focus par les touches du clavier ou un clic de la souris
   * -------------------------------------------------------------------------------------------
   */
  addColumn(...components) {
    this.#columns.push(components);
    this.addComponent(components[0]);
  }
  addColumnAt(index, ...components) {
    if (this.#columns.length === index) {
      this.addColumn(...components);
      return;
    }
    this.#columns.splice(index, 0, components);
    this.addComponentAt(index, components[0]);
  }
  removeColumn(index) {
    this.removeComponent(index);
    this.#columns.splice(index, 1);
  }
  removeColumns(components) {
    for (const component of components) {
      const index = this.#columns.findIndex(column => column[0] === component);
      this.#columns.splice(index, 1);
    }
    this.removeComponents(components);
  }
  removeAllColumns() {
    const components = [];
    for (const column of this.#columns) {
      components.push(column[0]);
    }
    this.setCurrent(this.#header);
    this.removeComponents(components);
    this.#columns = [];
  }
  getAllComponentsColumn(columnIndex) {
    // Inclut les composants des enfants
    const column = this.#columns[columnIndex];
    const components = [];
    for (const component of column) {
      const childFocusManager = this.getAccessibleFocusManager(component);
      if (childFocusManager) {
        for (const childComp of childFocusManager.getAllComponents()) {
          components.push(childComp);
        }
      } else {
        components.push(component);
      }
    }
    return components;
  }
  /*
   * Démarrage/Arrêt de la navigation au clavier
   * --------------------------------------------------
   */
  enableKeyNavigation() {
    super.enableKeyNavigation();

    const childFocusManager = this.getAccessibleChildFocusManager();
    if (!childFocusManager) {
      return;
    }
    // lorsque l'on est positionné sur un enfant qui gère son propre système de navigation, le focus doit aller sur le courant de cet enfant et non pas sur le courant du parent
    this.getCurrent()
      .removeTabIndex();

    // Le parent gère la navigation, mais la tabulation doit se positionner sur le courant de l'enfant
    childFocusManager.getCurrent()
      ?.setTabIndex(0);
  }

  /**
   * Récupère l'enfant dont le système de focus doit être également actif en même temps que son parent
   */
  getAccessibleChildFocusManager() {
    const childFocusManager = this.getChildFocusManager();
    if (!childFocusManager) {
      return null;
    }
    // Si on doit taper la touche Entrée pour entrer dans le composant enfant alors la navigation de ce dernier n'est pas géré par son parent
    if (childFocusManager.pressEnterToAccess()) {
      return null;
    }
    return childFocusManager;
  }

  /*
   * Navigation au clavier
   * ---------------------
   */
  interceptKeys() {
    const keys = [ 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown' ];
    if (super.isInside()) {
      keys.push('Escape');
    }
    if (this.canEnter()) {
      keys.push('Enter');
    }
    return keys;
  }

  /*
   * Entrée et sortie d'un système de navigation par les touches Entrée/Escape
   * -------------------------------------------------------------------------
   */
  /** @override */
  canEnter() {
    const accessibleFocusManager = this.getAccessibleChildFocusManager();
    if (accessibleFocusManager) {
      return accessibleFocusManager.canEnter();
    }
    return super.canEnter();
  }
  /** @override */
  enter() {
    const accessibleFocusManager = this.getAccessibleChildFocusManager();
    if (accessibleFocusManager) {
      const doEnter = this.getRootFocusManager()
        .callBeforeEnter(accessibleFocusManager.getCurrent());
      if (doEnter) {
        this.disableKeyNavigation();
        accessibleFocusManager.enter();
      }
      return;
    }
    super.enter();
  }

  /*
   * Prise de focus
   * ---------------------------------------------------
   */
  giveFocus() {
    const childFocusManager = this.getAccessibleChildFocusManager();
    if (childFocusManager) {
      childFocusManager.giveFocus();
    } else {
      this.getCurrent()
        .giveFocus();
    }
  }
  /** @override */
  focusToDirection(direction) {
    const position = this.getCurrentPosition();
    if (!position) {
      return;
    }
    let nextFocusable = null;
    if ([ 'Up', 'Down' ].includes(direction)) {
      nextFocusable = this.getFocusableNextRow(direction, position);
    } else if ([ 'Left', 'Right' ].includes(direction)) {
      nextFocusable = this.getFocusableNextColumn(direction, position);
    }
    if (nextFocusable) {
      this.setCurrent(nextFocusable);
      this.giveFocus();
    }
  }
  /**
   * Donne le focus au composant suivant à partir d'une position et en allant vers le haut ou vers le bas
   * @param {'Up'|'Down'} direction - direction vers laquelle se déplacer
   * @param {Position} position - colonne et ligne
   * @returns {Component|null} Composant suivant
   */
  getFocusableNextRow(direction, position) {
    if (position.rowIndex === 0 && direction === 'Up') {
      return this.isFocusable(this.#header) ? this.#header : null;
    }
    const searchPosition = getSearchPosition(direction, position);
    const nextCell = this.getCell(searchPosition);
    if (!nextCell) {
      return null;
    }
    if (nextCell.component && nextCell.focusable) {
      return nextCell.component;
    }
    return this.getFocusableNextRow(direction, searchPosition);
  }

  /**
   * Donne le focus au composant suivant à partir d'une position et en allant vers la droite ou vers la gauche
   * @param {'Left'|'Right'} direction - direction vers laquelle se déplacer
   * @param {Position} position - colonne et ligne
   * @returns {Component|null} Composant suivant
   */
  getFocusableNextColumn(direction, position) {
    const searchPosition = getSearchPosition(direction, position);
    if ([ -1, this.#columns.length ].includes(searchPosition.columnIndex)) {
      return null;
    }
    const nextCell = this.getCell(searchPosition);
    if (nextCell) {
      if (nextCell.focusable) {
        return nextCell.component;
      }
      return this.getFocusableNextColumn(direction, searchPosition);
    }
    // Cellules pouvant avoir le focus pour la colonne
    const focusableCells = this.getFocusableCells(searchPosition.columnIndex);
    if (focusableCells.length) {
      const nextComponent = focusableCells[focusableCells.length - 1];
      // En mode drag&drop, on ne souhaite se positionner sur les placeholder entre 2 colonnes que si on navigue sur la 1ere ligne
      if (!this.isPlaceholder(nextComponent) || position.rowIndex === 0) {
        return nextComponent;
      }
    }
    return this.getFocusableNextColumn(direction, searchPosition);
  }
  /**
   * Fournit le composant à la position demandée
   * @param {Position} position - position
   * @returns {Cell} composant à la position donnée + booléen indiquant s'il peut prendre le focus
   */
  getCell(position) {
    if ([ -1, this.#columns.length ].includes(position.columnIndex)) {
      return null;
    }
    const column = this.#columns[position.columnIndex];
    let index = 0;
    for (const columnComponent of column) {
      const focusManager = this.getAccessibleFocusManager(columnComponent);
      if (!focusManager) {
        if (index === position.rowIndex) {
          return { component: columnComponent, focusable: this.isFocusable(columnComponent) };
        }
        index++;
        continue;
      }
      const len = focusManager.getAllComponents().length;
      const indexChild = position.rowIndex - index;
      if (indexChild < len) {
        const childComponent = focusManager.getComponentAt(indexChild);
        return { component: childComponent, focusable: focusManager.isFocusable(childComponent) };
      }
      index += len;
    }
    return null;
  }
  getFocusableCells(columnIndex) {
    if ([ -1, this.#columns.length ].includes(columnIndex)) {
      return null;
    }
    const column = this.#columns[columnIndex];
    const cells = [];
    for (const columnComponent of column) {
      const focusManager = this.getAccessibleFocusManager(columnComponent);
      if (!focusManager) {
        if (this.isFocusable(columnComponent)) {
          cells.push(columnComponent);
        }
        continue;
      }
      focusManager.getAllComponents()
        .forEach(component => {
          if (focusManager.isFocusable(component)) {
            cells.push(component);
          }
        });
    }
    return cells;
  }
  getAccessibleFocusManager(component) {
    const childFocusManager = component.getFocusManager();
    if (childFocusManager && !childFocusManager.pressEnterToAccess()) {
      return childFocusManager;
    }
    return null;
  }
  /** @override */
  getCurrentFocusManager() {
    return this.getAccessibleChildFocusManager() || this;
  }

  /*
   * Positionnement du courant
   * ---------------------------------------------------
   */
  /** @override */
  setCurrent(current) {
    if (this.#header === current) {
      super.setCurrent(current);
      return;
    }
    for (const column of this.#columns) {
      for (const component of column) {
        if (component === current) {
          super.setCurrent(current);
          return;
        }
        const childFocusManager = this.getAccessibleFocusManager(component);
        if (!childFocusManager || !childFocusManager.getAllComponents()
          .includes(current)) {
          continue;
        }
        super.setCurrent(component);
        childFocusManager.setCurrent(current);
        // Il ne peut y avoir qu'un seul tabindex
        component.removeTabIndex();
        current.setTabIndex(0);
        return;
      }
    }
  }
  /** @override */
  removeCurrent() {
    if (!this.isNavigationActive()) {
      super.removeCurrent();
      return;
    }

    // Lorsque l'on quitte le composant enfant, son système de navigation doit être désactivé
    this.getAccessibleChildFocusManager()
      ?.disableKeyNavigation();

    super.removeCurrent();
  }
  /** @override */
  setCurrentBranch(target) {
    const component = this.getComponentWithTarget(target);
    if (component) {
      this.setCurrent(component);
    }

    const parentFocusManager = this.getParentFocusManager();
    parentFocusManager?.setCurrentBranch(target);
  }
  getComponentWithTarget(target) {
    const element = this.#header.getElementView();
    if (element === target || element.contains(target)) {
      return this.#header;
    }
    for (const column of this.#columns) {
      for (const component of column) {
        const element = component.getElementView();
        if (element === target || element.contains(target)) {
          return component;
        }
      }
    }
    return null;
  }
  getFirstFocusable() {
    if (this.isFocusable(this.#header)) {
      return this.#header;
    }
    return super.getFirstFocusable();
  }

  /**
   * Donne le position du composant courant
   * @returns {Position} - colonne et ligne du composant
   */
  getCurrentPosition() {
    const current = this.getCurrent();
    if (!current) {
      return null;
    }
    const currentFocusManager = this.getCurrentFocusManager();
    const componentToFind = currentFocusManager.getCurrent();

    if (this.#header === current) {
      return getHeaderPosition();
    }

    let columnIndex = 0;
    for (const column of this.#columns) {
      const index = column.findIndex(component => component === current);
      if (index === -1) {
        columnIndex++;
        continue;
      }
      const rowIndex = this.getAllComponentsColumn(columnIndex)
        .findIndex(component => component === componentToFind);
      return { columnIndex, rowIndex };
    }
    return null;
  }

  /** Drag& drop **/

  /** @override */
  enterDragDrop() {
    if (this.isDragDropReady()) {
      return true;
    }
    if (!super.enterDragDrop()) {
      return false;
    }

    for (const column of this.#columns) {
      for (const component of column) {
        const childFocusManager = this.getAccessibleFocusManager(component);
        if (childFocusManager) {
          childFocusManager.enterDragDrop();
        }
      }
    }
    return true;
  }
  /** @override */
  exitDragDrop() {
    if (!this.isDragDropReady()) {
      return false;
    }

    for (const column of this.#columns) {
      for (const component of column) {
        const childFocusManager = this.getAccessibleFocusManager(component);
        if (childFocusManager) {
          childFocusManager.exitDragDrop();
        }
      }
    }

    super.exitDragDrop();
  }

  /** @override */
  addPlaceholders() {
    const columns = [].concat(this.#columns);
    let lastColumn = null;
    for (const column of columns) {
      if (this.addColumnPlaceholder(column, 'before')) {
        lastColumn = column;
      }
    }
    if (lastColumn) {
      // Pour le dernier composant concerné par le drag&drop, ajouter un placeholder après
      this.addColumnPlaceholder(lastColumn, 'after');
      return true;
    }
    return false;
  }
  /** @override */
  removePlaceHolders() {
    const placeholders = this.getAllComponents()
      .filter(component => this.isPlaceholder(component));
    this.destroyPlaceHolders(placeholders);
    this.removeColumns(placeholders);
  }
  addColumnPlaceholder(column, position) {
    const placeholder = super.createPlaceholder(column[0], position);
    if (!placeholder) {
      return false;
    }
    const indexColumn = this.#columns.findIndex(col => col === column);
    if (position === 'before') {
      this.addColumnAt(indexColumn, placeholder);
    } else {
      this.addColumnAt(indexColumn + 1, placeholder);
    }
    return true;
  }

}
/**
 * Indique si la position est sur le header
 * @param {Position} position - Position
 * @returns true si la position représente le header
 */
function isHeaderPosition(position) {
  return position.columnIndex === undefined && position.rowIndex === undefined;
}
/**
 * Retourne la position pour le header
 * @returns {Position}
 */
function getHeaderPosition() {
  return {};
}
/**
 * Donne les positions à rechercher selon la direction vers laquelle aller par rapport à la position initiale
 * @param {'Left'|'Right'|'Up'|'Down'} direction - direction vers laquelle se déplacer
 * @param {Position} position - colonne et ligne
 * @returns {Position} colonne et ligne recherchée
 */
function getSearchPosition(direction, position) {
  if (isHeaderPosition(position)) {
    if (direction === 'Down') {
      return { columnIndex: 0, rowIndex: 0 };
    }
    // Ne pas changer de position si droite, gauche ou haut en fournissant des positions hors limite
    return { columnIndex: -1, rowIndex: -1 };
  }
  // Les placeholders horizontaux ne sont accessibles que lorsque l'on navigue sur la 1ere ligne. Ainsi, sur les autres lignes, le déplacement est de 2 colonnes pour ne pas se positionner sur une colonne qui ne contient que le placeholder horizontal
  const searchColumnIndex = position.columnIndex + (direction === 'Left' ? -1 : (direction === 'Right' ? 1 : 0));
  const searchRowIndex = position.rowIndex + (direction === 'Up' ? -1 : (direction === 'Down' ? 1 : 0));
  return { columnIndex: searchColumnIndex, rowIndex: searchRowIndex };
}
export default ColumnFocusManager;