import { CRUD_MODE, ITEM_LAYOUT, STATUS } from '../../tools/Constants.js';
import View from './View.js';
/** @import TreeItem from '../../data/TreeItem.js' */
/** @import {ItemInfos} from '../../data/TreeItem.js'; */

class ItemView extends View {

  name = 'ItemView';

  #currentStatusClass;
  #currentCRUDModeClass;

  /**
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {TreeItem} data.treeItem - Informations sur la tache
   * @param {ITEM_LAYOUT} data.layout - Affichage souhaité
   * @param {Array<RIGHT>} data.rights - Droits en création, modification et suppression
   */
  constructor(data) {
    super(data);
    this.viewAdded(data);
  }

  /**
   * @override {@link View.viewAdded}
   * Méthode appelée une fois la vue ajoutée ou redessinée
   * @param {Object} data - Données à utiliser pour mettre à jour la vue
   * @param {TreeItem} data.treeItem - Informations sur la tache
   * @param {ITEM_LAYOUT} data.layout - Affichage souhaité
   * @param {Array<RIGHT>} data.rights - Droits en création, modification et suppression
   */
  viewAdded(data) {
    this.getElementView().classList.add(getClassForViewChoice(data.layout));
    if (ITEM_LAYOUT.isPostIt(data.layout)) {
      this.getElementView().classList.add(getClassColorForViewChoice(data.layout));
    }
  }

  /**
   * @override {@link View.getHtmlView}
   * @returns {string} - Code HTML de l'item
   */
  getHtmlView() {
    return String.raw`<article id="itemArticle" class="item" aria-label="Item">
          <header class="item__header" tabindex="-1" >
            <template id="done" class="item__checkbox" aria-label="Effectué/non effectué" aria-description="Cliquez pour marquer comme effectué"></template>
            <template id="title" class="item__title" aria-label="Titre de l'item"></template>
            <template id="toolbar" aria-controls="itemArticle" class="item__toolbar" ></template>
          </header>
          <template id="text" class="item__text" aria-label="Détail de l'item"></template>
          <footer class="item__footer"><template id="footerToolbar" aria-controls="itemArticle" class="item__footer-toolbar" ></template></footer>
      </article>`;
  }

  /**
   * @override {@link View.refreshView}
   * @param {Object} data - Données à utiliser pour rafraîchir la vue
   * @param {TreeItem} data.treeItem - Informations sur la tache
   * @param {ITEM_LAYOUT} data.layout - Affichage souhaité
   */
  refreshView(data) {
    super.refreshView(data);
    this.viewAdded(data);
  }

  /**
   * Positionne les informations de la tâche sur les éléments
   * @param {ItemInfos} itemInfos - Informations sur la tache
   */
  setItemValues(itemInfos) {
    if (itemInfos.id) {
      this.getElementView()
        .setAttribute('data-item-id', itemInfos.id);
    }
    if (itemInfos.status) {
      const newStatusClass = getClassForStatus(itemInfos.status);
      if (this.#currentStatusClass) {
        this.getElementView().classList.replace(this.#currentStatusClass, newStatusClass);
      } else {
        this.getElementView().classList.add(newStatusClass);
      }
      this.#currentStatusClass = newStatusClass;
    }
    if (itemInfos.CRUDMode) {
      this.setCRUDMode(itemInfos.CRUDMode);
    }
  }

  setCRUDMode(CRUDMode) {
    const newCRUDModeClass = getClassForCRUDMode(CRUDMode);
    if (this.#currentCRUDModeClass) {
      this.getElementView().classList.replace(this.#currentCRUDModeClass, newCRUDModeClass);
    } else {
      this.getElementView().classList.add(newCRUDModeClass);
    }
    this.#currentCRUDModeClass = newCRUDModeClass;
  }

  setTreeItemId(treeItemId) {
    this.getElementView()
      .setAttribute('data-tree-item-id', treeItemId);
  }

  setToDelete() {
    this.getElementView().classList.add('item--crud-deleted');
  }
  undoToDelete() {
    this.getElementView().classList.remove('item--crud-deleted');
  }

}

/**
 * Retourne la classe CSS correspondant à la vue demandée
 * @param {ITEM_LAYOUT} layout - Vue demandée
 * @returns {string} - Classe CSS correspondante
 */
function getClassForViewChoice(layout) {
  if (ITEM_LAYOUT.isPostIt(layout)) {
    return 'item--post-it';
  }
  switch (layout) {
    case ITEM_LAYOUT.Todo:
      return 'item--todo';
    case ITEM_LAYOUT.Title:
      return 'item--title';
    default:
      return 'item--block';
  }
}
/**
 * Retourne la classe CSS pour la couleur d'un post-it
 * @param {ITEM_LAYOUT} layout - Vue demandée
 * @returns {string} - Classe CSS correspondante
 */
function getClassColorForViewChoice(layout) {
  switch (layout) {
    case ITEM_LAYOUT.PostIt:
      return 'item--color';
    case ITEM_LAYOUT.Story:
      return 'story--color';
    case ITEM_LAYOUT.Rules:
      return 'rules--color';
    case ITEM_LAYOUT.Sample:
      return 'sample--color';
    case ITEM_LAYOUT.Question:
      return 'question--color';
    default:
      return '';
  }
}
/**
 * Retourne la classe CSS correspondant au statut
 * @param {STATUS} status - Statut
 * @returns {string} - classe CSS à appliquer pour faire ressortir le statut
 */
function getClassForStatus(status) {
  switch (status) {
    case STATUS.ORPHAN:
      return 'item--status-orphan';
    case STATUS.NEXT_NOT_FOUND:
      return 'item--status-next-not-found';
    case STATUS.TOTAL_ORPHAN:
      return 'item--status-total-orphan';
    case STATUS.LOOP:
      return 'item--status-loop';
    default:
      return 'item--status-ok';
  }
}
/**
 * Retourne la classe CSS correspondant au statut
 * @param {CRUD_MODE} mode - Mode CRUD de l'item
 * @returns {string} - classe CSS à appliquer
 */
function getClassForCRUDMode(mode) {
  switch (mode) {
    case CRUD_MODE.CREATE:
      return 'item--crud-created';
    case CRUD_MODE.UPDATE:
      return 'item--crud-updated';
    case CRUD_MODE.DELETE:
      return 'item--crud-deleted';
    case CRUD_MODE.READ:
      return 'item--crud-read';
    default:
      return '';
  }
}

export default ItemView;