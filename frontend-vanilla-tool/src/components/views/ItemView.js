import { RIGHT, ITEM_LAYOUT, STATUS, CRUD_MODE } from '../../tools/Constants.js';
import View from './View.js';
/** @import TreeItem from '../../data/TreeItem.js' */
/** @import {ItemInfos} from '../../data/TreeItem.js'; */

class ItemView extends View {

  name = 'ItemView';

  #identify;
  #title;
  #text;

  #rights;
  #currentStatusClass;
  #currentCRUDModeClass;

  #onInputCallback = () => {};
  #onFocusCallback = () => {};

  /**
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {TreeItem} data.treeItem - Informations sur la tache
   * @param {ITEM_LAYOUT} data.layout - Affichage souhaité
   * @param {Array<RIGHT>} data.rights - Droits en création, modification et suppression
   */
  constructor(data) {
    super(data);
    this.getElementView()
      .addEventListener('focus', this.onFocus.bind(this), true);

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
    this.#rights = data.rights;
    this.getElementView().classList.add(getClassForViewChoice(data.layout));
    if (ITEM_LAYOUT.isPostIt(data.layout)) {
      this.getElementView().classList.add(getClassColorForViewChoice(data.layout));
    }
    this.majNodes();
  }

  /**
   * @override {@link View.getHtmlView}
   * @returns {string} - Code HTML de l'item
   */
  getHtmlView() {
    return String.raw`<section class="item">
      <template id="toolbar" aria-controls="itemArticle" class="item__toolbar" ></template>
      <article id="itemArticle" class="item__article">
          <span id="identify" class="item__identify"></span>
          <template id="done" class="item__checkbox" ></template>
          <div contenteditable="true" class="item__title" id="title"></div>
          <div contenteditable="true" class="item__text" id="text"></div>
      </article></section>`;
  }

  /**
   * @override {@link View.refreshView}
   * @param {Object} data - Données à utiliser pour rafraîchir la vue
   * @param {TreeItem} data.treeItem - Informations sur la tache
   * @param {ITEM_LAYOUT} data.layout - Affichage souhaité
   */
  refreshView(data) {
    this.removeEventListeners();
    super.refreshView(data);
    this.viewAdded(data);
    this.addEventListeners();
  }

  /**
   * Positionne la fonction à appeler lorsqu'une modification est effectuée (titre, texte, statut)
   * @param {Function} updateCallback - Fonction à appeler lorsqu'une modification est effectuée
   */
  setOnChangeCallback(updateCallback) {
    if (!this.#rights.includes(RIGHT.update)) {
      return;
    }
    this.#title.removeEventListener('input', this.#onInputCallback);
    this.#text.removeEventListener('input', this.#onInputCallback);
    this.#onInputCallback = event => {
      const property = event.target.getAttribute('id');
      const value = property === 'text' || property === 'title' ? event.target.innerHTML : event.target.value;
      updateCallback(property, value);
    };
    this.#title.addEventListener('input', this.#onInputCallback);
    this.#text.addEventListener('input', this.#onInputCallback);
  }

  setOnFocusCallback(onFocusCallback) {
    this.#onFocusCallback = onFocusCallback;
  }
  onFocus(event) {
    if (event.relatedTarget === null || (!this.getElementView()
      .contains(event.relatedTarget))) {
      this.#onFocusCallback();
    }
  }

  majNodes() {
    const mainNode = this.getElementView();
    this.#identify = mainNode.querySelector('#identify');
    this.#title = mainNode.querySelector('#title');
    this.#text = mainNode.querySelector('#text');
  }

  /**
   * Positionne les informations de la tâche sur les éléments
   * @param {ItemInfos} itemInfos - Informations sur la tache
   */
  setItemValues(itemInfos) {
    this.#identify.textContent = itemInfos.id === undefined ? '' : itemInfos.id;
    this.#title.innerHTML = itemInfos.title;
    if (itemInfos.text) {
      this.#text.innerHTML = itemInfos.text;
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

  setToDelete() {
    this.getElementView().classList.add('item--crud-deleted');
  }

  undoToDelete() {
    this.getElementView().classList.remove('item--crud-deleted');
  }

  giveFocus() {
    this.#title.focus();
  }

  setReadOnly() {
    super.setReadOnly();
    this.#title.contentEditable = false;
    this.#text.contentEditable = false;
    this.getElementView()
      .setAttribute('tabindex', '0');
  }

  /** @override */
  setDisabled() {
    // Laisser la barre d'outil accessible pour pouvoir annuler le marquage comme supprimé
    this.#title.classList.add('disabled');
    this.#text.classList.add('disabled');
    this.#title.contentEditable = false;
    this.#text.contentEditable = false;
  }

  setEnabled() {
    this.#title.classList.remove('disabled');
    this.#text.classList.remove('disabled');
    this.#title.contentEditable = true;
    this.#text.contentEditable = true;
  }

  addEventListeners() {
    if (!this.#rights.includes(RIGHT.update)) {
      return;
    }
    this.#title.addEventListener('input', this.#onInputCallback);
    this.#text.addEventListener('input', this.#onInputCallback);
  }

  removeEventListeners() {
    if (!this.#rights.includes(RIGHT.update)) {
      return;
    }
    this.#title.removeEventListener('input', this.#onInputCallback);
    this.#text.removeEventListener('input', this.#onInputCallback);
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