import { VIEW_CHOICE } from '../../tools/Constants.js';
import CompositeView from './CompositeView.js';

class ItemView extends CompositeView {

  name = 'ItemView';

  #identify;
  #title;
  #text;
  #done;
  #doAddChild;
  #doDelete;

  #isNew;
  #viewChoice;

  #updateCallback = () => {};
  #doneCallback = () => {};

  #doAddChildCallback = () => {};
  #doDeleteCallback = () => {};

  /**
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {ItemInfos} data.itemInfos - Informations sur la tache
   * @param {VIEW_CHOICE} data.viewChoice - Affichage souhaité
   */
  constructor(data) {
    super(data);
    this.#viewChoice = data.viewChoice;
    this.#isNew = data.itemInfos.id === undefined;

    this.majNodes();
    this.setItemValues(data.itemInfos);
    this.setContentEditable();
  }

  /**
   * @override {@link View.getHtmlView}
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {ItemInfos} data.itemInfos - Informations sur la tache
   * @param {VIEW_CHOICE} data.viewChoice - Affichage souhaité
   * @returns {string} - Code HTML du bouton
   */
  getHtmlView(data) {
    return getHtmlArticle(data.itemInfos.id, data.viewChoice);
  }
  /** @override */
  getSpaceChildren() {
    return document.createElement('div');
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

  /**
   * Positionne la fonction à appeler lorsqu'une action d'ajout d'enfant est effectuée
   * @param {Function} doAddChildCallback - Fonction appelée lorsqu'une action d'ajout d'enfant est effectuée
   */
  setDoAddChildCallback(doAddChildCallback) {
    if (!this.#doAddChild) {
      return;
    }
    this.#doAddChild.removeEventListener('click', this.#doAddChildCallback);
    this.#doAddChildCallback = doAddChildCallback;
    this.#doAddChild.addEventListener('click', this.#doAddChildCallback);
  }
  /**
   * Positionne la fonction à appeler lorsqu'une action de suppression est effectuée
   * @param {Function} doDeleteCallback - Fonction appelée lorsqu'une action de suppression est effectuée
   */
  setDoDeleteCallback(doDeleteCallback) {
    if (!this.#doDelete) {
      return;
    }
    this.#doDelete.removeEventListener('click', this.#doDeleteCallback);
    this.#doDeleteCallback = doDeleteCallback;
    this.#doDelete.addEventListener('click', this.#doDeleteCallback);
  }

  /**
   * Positionne la fonction à appeler lorsqu'une modification est effectuée (titre, texte, statut)
   * @param {Function} updateCallback - Fonction appelée lorsqu'une modification est effectuée
   */
  setUpdateCallback(updateCallback) {
    this.#title.removeEventListener('input', this.#updateCallback);
    this.#text.removeEventListener('input', this.#updateCallback);
    this.#done.removeEventListener('change', this.#doneCallback);

    this.#updateCallback = event => {
      const property = event.target.getAttribute('id');
      const value = property === 'text' || property === 'title' ? event.target.innerHTML : event.target.value;
      updateCallback(property, value);
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
    this.#doAddChild = mainNode.querySelector('#doAddChild');
    this.#doDelete = mainNode.querySelector('#doDelete');
  }

  setItemValues(itemInfos) {
    this.setIdentify(itemInfos.id);

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

  setIdentify(identify) {
    this.#isNew = identify === undefined;
    this.#identify.textContent = identify === undefined ? '' : identify;
  }

  setContentEditable() {
    const contentEditable = this.#viewChoice === VIEW_CHOICE.Tree && !this.#isNew ? false : true;
    if (contentEditable) {
      this.getElementView().classList.remove('item--readonly');
      this.#title.contenteditable = 'true';
      this.#text.contenteditable = 'true';
      this.#done.disabled = true;
    } else {
      this.getElementView().classList.add('item--readonly');
      this.#title.contenteditable = 'false';
      this.#text.contenteditable = 'false';
      this.#done.disabled = false;
    }
  }

  addEventListeners() {
    this.#title.addEventListener('input', this.#updateCallback);
    this.#text.addEventListener('input', this.#updateCallback);
    this.#done.addEventListener('change', this.#doneCallback);
    if (this.#doAddChild) {
      this.#doAddChild.addEventListener('click', this.#doAddChildCallback);
    }
    this.#doDelete.addEventListener('click', this.#doDeleteCallback);
  }

  removeEventListeners() {
    this.#title.removeEventListener('input', this.#updateCallback);
    this.#text.removeEventListener('input', this.#updateCallback);
    this.#done.removeEventListener('change', this.#doneCallback);
    if (this.#doAddChild) {
      this.#doAddChild.removeEventListener('click', this.#doAddChildCallback);
    }
    this.#doDelete.removeEventListener('click', this.#doDeleteCallback);
  }

}

/**
 * Partie HTML décrivant l'item
 * @param {string} identify - Identifiant de la tâche
 * @param {VIEW_CHOICE} viewChoice - Affichage souhaité
 * @returns {string} - Vue HTML de l'item
 */
function getHtmlArticle(identify, viewChoice) {
  const viewChoiceClass = getClassForViewChoice(viewChoice);
  return String.raw`<section id="item" class="item__content ${ viewChoiceClass }">
    <article class="item__article">
        <span id="identify" class="item__identify">${ identify }</span>
        <input type="checkbox" id="done" class="item__done"/>
        <div contenteditable="true" class="item__title" id="title"></div>
        <div contenteditable="true" class="item__text" id="text"></div>
    </article>
    <aside class="item__toolbar">
        <button id="doAddChild" class="item__doAddChild"> + </button>
        <button id="doDelete" class="item__doDelete"> - </button>
        <button id="doView" class="item__doView">O</button>
      </aside>
    </section>`;
}
/**
 * Retourne la classe CSS correspondant à la vue demandée
 * @param {VIEW_CHOICE} viewChoice - Vue demandée
 * @returns {string} - Classe CSS correspondante
 * @example
 */
function getClassForViewChoice(viewChoice) {
  switch (viewChoice) {
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