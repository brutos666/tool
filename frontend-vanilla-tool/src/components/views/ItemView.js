import { VIEW_CHOICE } from '../../tools/Constants.js';
import CompositeView from './CompositeView.js';

class ItemView extends CompositeView {

  #identify;
  #title;
  #text;
  #done;
  #delete;

  #updateCallback = () => {};
  #deleteCallback = () => {};
  #focusCallback = () => {};
  #doneCallback = () => {};

  /**
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {ItemInfos} data.itemInfos - Informations sur la tache
   * @param {VIEW_CHOICE} data.viewChoice - Affichage souhaité
   */
  constructor(data) {
    super(data);

    this.majNodes();
    this.setItemValues(data.itemInfos);
  }

  /**
   * @override {@link View.getHtmlView}
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {ItemInfos} data.itemInfos - Informations sur la tache
   * @param {VIEW_CHOICE} data.viewChoice - Affichage souhaité
   * @returns {string} - Code HTML du bouton
   */
  getHtmlView(data) {
    switch (data.viewChoice) {
      case VIEW_CHOICE.Detail:
        return getPostItView();
      case VIEW_CHOICE.SampleMapping:
        return getPostItView();
      case VIEW_CHOICE.TodoList:
        return getTodoItemView();
      case VIEW_CHOICE.Hierarchy:
        return getPostItView();
      default:
        return getPostItView();
    }
  }

  /**
   * @override {@link View.refreshView}
   * @param {Object} data - Données à utiliser pour rafraîchir la vue
   * @param {ItemInfos} data.itemInfos - Informations sur la tache
   * @param {string} data.viewChoice - Affichage souhaité
   */
  refreshView(data) {
    this.removeEventListeners();
    super.refreshView(data);
    this.majNodes();
    this.setItemValues(data.itemInfos);
    this.addEventListeners();
  }

  setDeleteCallback(deleteCallback) {
    this.#delete.removeEventListener('click', this.#deleteCallback);
    this.#deleteCallback = deleteCallback;
    this.#delete.addEventListener('click', this.#deleteCallback);
  }

  /**
   * Positionne la fonction à appeler lorsqu'une modification est effectuée sur la tache
   * @param {Function} updateCallback - Fonction appelée lorsqu'une modification est effectuée sur la tache
   */
  setUpdateCallback(updateCallback) {
    this.#title.removeEventListener('input', this.#updateCallback);
    this.#text.removeEventListener('input', this.#updateCallback);
    this.#done.removeEventListener('change', this.#doneCallback);

    this.#updateCallback = event => {
      const property = event.target.getAttribute('id');
      const value = event.target.value;
      updateCallback(property, value);
      if (property === 'text' && this.#text instanceof HTMLTextAreaElement) {
        this.#text.style.height = 'auto';
        this.#text.style.height = `${ this.#text.scrollHeight }px`;
      }
    };
    this.#doneCallback = event => {
      const value = event.target.checked ? 'DONE' : 'TODO';
      updateCallback('state', value);
    };

    this.#title.addEventListener('input', this.#updateCallback);
    this.#text.addEventListener('input', this.#updateCallback);
    this.#done.addEventListener('change', this.#doneCallback);
  }

  majNodes() {
    const mainNode = this.getNodeView();
    this.#identify = mainNode.querySelector('#identify');
    this.#title = mainNode.querySelector('#title');
    this.#text = mainNode.querySelector('#text');
    this.#done = mainNode.querySelector('#done');
    this.#delete = mainNode.querySelector('#delete');
  }

  setItemValues(itemInfos) {
    if (itemInfos.id) {
      this.#identify.textContent = itemInfos.id;
    }
    if (itemInfos.title) {
      this.#title.value = itemInfos.title;
    }
    if (itemInfos.text) {
      this.#text.value = itemInfos.text;
    }
    if (itemInfos.state) {
      this.#done.checked = itemInfos.state === 'DONE';
    }
  }

  setIdentify(identify) {
    this.#identify.value = identify;
  }

  addEventListeners() {
    this.#title.addEventListener('input', this.#updateCallback);
    this.#text.addEventListener('input', this.#updateCallback);
    this.#done.addEventListener('change', this.#doneCallback);
    this.#delete.addEventListener('click', this.#deleteCallback);
    this.#focusCallback = () => {
      const scrollHeight = this.#text.scrollHeight;
      if (scrollHeight > this.#text.clientHeight) {
        this.#text.style.height = `${ scrollHeight }px`;
      }
    };
    this.#text.addEventListener('focus', this.#focusCallback);
  }

  removeEventListeners() {
    this.#title.removeEventListener('input', this.#updateCallback);
    this.#text.removeEventListener('input', this.#updateCallback);
    this.#done.removeEventListener('change', this.#doneCallback);
    this.#text.removeEventListener('focus', this.#focusCallback);
    this.#delete.removeEventListener('click', this.#deleteCallback);
  }

}
/**
 * Création de la vue HTML d'une tâche
 * @returns {string} - Vue HTML de la tâche
 */
function getTodoItemView() {
  return String.raw`
      <section class="todo-item">
        <span id="identify"></span>
        <input type="checkbox" id="done"/>
        <input type="text" id="title"/>
        <textarea class="todo-item__text" id="text"></textarea>
        <button id="delete">Supprimer</button>
      </section>`;
}

/**
 * Création de la vue HTML d'une tâche
 * @returns {string} - Vue HTML de la tâche
 */
function getPostItView() {
  return String.raw`
      <section class="post-it-item">
        <span id="identify"></span>
        <input type="checkbox" id="done"/>
        <input type="text" id="title"/>
        <textarea class="post-it-item__text" id="text"></textarea>
        <button id="delete">Supprimer</button>
      </section>`;
}

export default ItemView;