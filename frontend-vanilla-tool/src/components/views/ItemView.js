import { VIEW_CHOICE } from '../../tools/Constants.js';
import View from './View.js';
/** @import TreeItem from '../../data/TreeItem.js' */
/** @import {ItemInfos} from '../../data/TreeItem.js'; */

class ItemView extends View {

  name = 'ItemView';

  #identify;
  #title;
  #text;
  #done;

  #onInputCallback = () => {};
  #onDoneChangeCallback = () => {};

  /**
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {TreeItem} data.treeItem - Informations sur la tache
   * @param {VIEW_CHOICE} data.layout - Affichage souhaité
   */
  constructor(data) {
    super(data);

    this.majNodes();
    this.setItemValues(data.treeItem.getItemInfos());
  }

  /**
   * @override {@link View.getHtmlView}
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {TreeItem} data.treeItem - Informations sur la tache
   * @param {VIEW_CHOICE} data.layout - Affichage souhaité
   * @returns {string} - Code HTML du bouton
   */
  getHtmlView(data) {
    return getHtmlArticle(data.treeItem.getItemId(), data.layout);
  }

  /**
   * @override {@link View.refreshView}
   * @param {Object} data - Données à utiliser pour rafraîchir la vue
   * @param {TreeItem} data.treeItem - Informations sur la tache
   * @param {VIEW_CHOICE} data.layout - Affichage souhaité
   */
  refreshView(data) {
    this.removeEventListeners();
    super.refreshView(data);
    this.majNodes();
    this.setItemValues(data.treeItem.getItemInfos());
    this.addEventListeners();
  }

  /**
   * Positionne la fonction à appeler lorsqu'une modification est effectuée (titre, texte, statut)
   * @param {Function} updateCallback - Fonction à appeler lorsqu'une modification est effectuée
   */
  setOnChangeCallback(updateCallback) {
    this.#title.removeEventListener('input', this.#onInputCallback);
    this.#text.removeEventListener('input', this.#onInputCallback);
    this.#done.removeEventListener('change', this.#onDoneChangeCallback);

    this.#onInputCallback = event => {
      const property = event.target.getAttribute('id');
      const value = property === 'text' || property === 'title' ? event.target.innerHTML : event.target.value;
      updateCallback(property, value);
    };
    this.#onDoneChangeCallback = event => {
      const value = event.target.checked ? 'DONE' : 'TODO';
      updateCallback('state', value);
    };

    this.#title.addEventListener('input', this.#onInputCallback);
    this.#text.addEventListener('input', this.#onInputCallback);
    this.#done.addEventListener('change', this.#onDoneChangeCallback);
  }

  majNodes() {
    const mainNode = this.getNodeView();
    this.#identify = mainNode.querySelector('#identify');
    this.#title = mainNode.querySelector('#title');
    this.#text = mainNode.querySelector('#text');
    this.#done = mainNode.querySelector('#done');
  }

  /**
   * Positionne les informations de la tâche sur les éléments
   * @param {ItemInfos} itemInfos - Informations sur la tache
   */
  setItemValues(itemInfos) {
    this.#identify.textContent = itemInfos.id === undefined ? '' : itemInfos.id;
    if (itemInfos.title) {
      this.#title.innerHTML = itemInfos.title;
    }
    if (itemInfos.text) {
      this.#text.innerHTML = itemInfos.text;
    }
    if (itemInfos.state) {
      this.#done.checked = itemInfos.state === 'DONE';
    }
  }

  setReadOnly(readOnly) {
    if (readOnly) {
      this.getElementView().classList.add('item--readonly');
      this.#title.contenteditable = 'false';
      this.#text.contenteditable = 'false';
      this.#done.disabled = false;
      return;
    }
    this.getElementView().classList.remove('item--readonly');
    this.#title.contenteditable = 'true';
    this.#text.contenteditable = 'true';
    this.#done.disabled = true;
  }

  addEventListeners() {
    this.#title.addEventListener('input', this.#onInputCallback);
    this.#text.addEventListener('input', this.#onInputCallback);
    this.#done.addEventListener('change', this.#onDoneChangeCallback);
  }

  removeEventListeners() {
    this.#title.removeEventListener('input', this.#onInputCallback);
    this.#text.removeEventListener('input', this.#onInputCallback);
    this.#done.removeEventListener('change', this.#onDoneChangeCallback);
  }

}

/**
 * Partie HTML décrivant l'item
 * @param {string} identify - Identifiant de la tâche
 * @param {VIEW_CHOICE} layout - Affichage souhaité
 * @returns {string} - Vue HTML de l'item
 */
function getHtmlArticle(identify, layout) {
  const viewChoiceClass = getClassForViewChoice(layout);
  return String.raw`<article class="item__article ${ viewChoiceClass }">
        <span id="identify" class="item__identify">${ identify }</span>
        <input type="checkbox" id="done" class="item__done"/>
        <div contenteditable="true" class="item__title" id="title"></div>
        <div contenteditable="true" class="item__text" id="text"></div>
    </article>`;
}
/**
 * Retourne la classe CSS correspondant à la vue demandée
 * @param {VIEW_CHOICE} layout - Vue demandée
 * @returns {string} - Classe CSS correspondante
 * @example
 */
function getClassForViewChoice(layout) {
  switch (layout) {
    case VIEW_CHOICE.Detail:
      return 'item--post-it';
    case VIEW_CHOICE.SampleMapping:
      return 'item--post-it';
    case VIEW_CHOICE.TodoList:
      return 'item--todo';
    case VIEW_CHOICE.Tree:
      return 'item--tree';
    default:
      return 'item--block';
  }
}

export default ItemView;