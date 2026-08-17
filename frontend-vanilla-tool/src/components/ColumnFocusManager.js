import DOMUtilities from '../tools/DOMUtilities.js';
import CompositeFocusManager from './CompositeFocusManager.js';
/** @import Component from './Component.js'; */

class ColumnFocusManager extends CompositeFocusManager {

  name = 'ColumnFocusManager';
  /**
   * @typedef {Object} Position - Informations sur l'item
   * @property {number} columnIndex - Index de la colonne
   * @property {number} rowIndex - Index du composant dans la colonne (prise en compte des composants enfants)
   */

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
  /*
   * Colonnes contenant les composants pouvant prendre le focus par les touches du clavier ou un clic de la souris
   * -------------------------------------------------------------------------------------------
   */
  addColumn(...components) {
    for (const component of components) {
      this.addComponent(component);
    }
    this.#columns.push(components);
  }
  addColumnAt(index, ...components) {
    if (this.#columns.length === index) {
      this.addColumn(...components);
      return;
    }
    const column = this.#columns[index];
    let componentIndex = this.getAllComponents()
      .findIndex(component => component === column[0]);
    for (const component of components) {
      this.addComponentAt(componentIndex, component);
      componentIndex++;
    }
    this.#columns.splice(index, 0, components);
  }
  removeColumn(index) {
    const column = this.#columns[index];
    for (const component of column) {
      this.removeGivenComponent(component);
    }
    this.#columns.splice(index, 1);
  }
  removeAllColumns() {
    super.removeAllComponents();
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
  isControlChildNavigation() {
    // Indique que le système de navigation des enfants (hors accès avec touche Entrée) est géré ici
    return true;
  }

  /*
   * Navigation au clavier
   * ---------------------
   */
  interceptKeys() {
    const keys = [ 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown' ];
    if (super.canExit()) {
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
    const childFocusManager = this.getAccessibleChildFocusManager();
    if (childFocusManager) {
      return childFocusManager.canEnter();
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
  /** @override */
  focusToDirection(direction) {
    const position = this.getCurrentPosition();
    if (!position) {
      return;
    }
    if ([ 'Up', 'Down' ].includes(direction)) {
      this.giveFocusToNextRow(direction, position);
    } else if ([ 'Left', 'Right' ].includes(direction)) {
      this.giveFocusToNextColumn(direction, position);
    }
  }
  /**
   * Donne le focus au composant suivant à partir d'une position et en allant vers le haut ou vers le bas
   * @param {'Up'|'Down'} direction - direction vers laquelle se déplacer
   * @param {Position} position - colonne et ligne
   * @returns composant trouvé
   */
  giveFocusToNextRow(direction, position) {
    const searchPosition = getSearchPosition(direction, position);
    const components = this.getAllComponentsColumn(position.columnIndex);
    const nextComponent = components[searchPosition.rowIndex] || components[position.rowIndex];
    this.giveFocusToComponent(searchPosition.columnIndex, nextComponent);
  }
  /**
   * Donne le focus au composant suivant à partir d'une position et en allant vers la droite ou vers la gauche
   * @param {'Left'|'Right'} direction - direction vers laquelle se déplacer
   * @param {Position} position - colonne et ligne
   * @returns composant trouvé
   */
  giveFocusToNextColumn(direction, position) {
    const searchPosition = getSearchPosition(direction, position);
    if ([ -1, this.#columns.length ].includes(searchPosition.columnIndex)) {
      return;
    }
    const components = this.getAllComponentsColumn(searchPosition.columnIndex);
    if (!components.length) {
      this.giveFocusToNextColumn(direction, searchPosition);
      return;
    }
    const nextComponent = components[searchPosition.rowIndex] || components[components.length - 1];
    this.giveFocusToComponent(searchPosition.columnIndex, nextComponent);
  }
  giveFocusToComponent(columnIndex, nextComponent) {
    const column = this.#columns[columnIndex];
    if (column.includes(nextComponent)) {
      this.setCurrent(nextComponent);
      this.giveFocus();
      return;
    }
    for (const component of column) {
      const childFocusManager = this.getAccessibleFocusManager(component);
      if (childFocusManager?.getAllComponents()
        .includes(nextComponent)) {
        this.setCurrent(component);
        childFocusManager.setCurrent(nextComponent);
        // Il ne peut y avoir qu'un seul tabindex
        component.setTabIndex(-1);
        nextComponent.setTabIndex(0);
        break;
      }
    }
    this.giveFocus();
  }
  /** @override */
  isFocusable(component) {
    // Le choix a été fait de pouvoir naviguer dans des composants inaccessible
    return !component.isHidden() && !DOMUtilities.isHidden(component.getElementView()) && this.getAllComponents()
      .includes(component);
  }
  getAccessibleFocusManager(component) {
    const childFocusManager = component.getFocusManager();
    if (childFocusManager && !childFocusManager.pressEnterToAccess()) {
      return childFocusManager;
    }
    return null;
  }

  /*
   * Positionnement du courant
   * ---------------------------------------------------
   */
  /**
   * Donne le position du composant courant
   * @returns {Position} - colonne et ligne du composant
   */
  getCurrentPosition() {
    const current = this.getCurrent();
    if (!current) {
      return null;
    }

    const childFocusManager = this.getAccessibleChildFocusManager();
    const componentToFind = childFocusManager ? childFocusManager.getCurrent() : current;

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

}
/**
 * Donne les positions à rechercher selon la direction vers laquelle aller par rapport à la position initiale
 * @param {'Left'|'Right'|'Up'|'Down'} direction - direction vers laquelle se déplacer
 * @param {Position} position - colonne et ligne
 * @returns {Position} colonne et ligne recherchée
 */
function getSearchPosition(direction, position) {
  const searchColumnIndex = position.columnIndex + (direction === 'Left' ? -1 : (direction === 'Right' ? 1 : 0));
  const searchRowIndex = position.rowIndex + (direction === 'Up' ? -1 : (direction === 'Down' ? 1 : 0));
  return { columnIndex: searchColumnIndex, rowIndex: searchRowIndex };
}
export default ColumnFocusManager;