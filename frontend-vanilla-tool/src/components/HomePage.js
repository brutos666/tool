'use strict';

import ItemCallsRequests from '../requests/ItemCallsRequests.js';
import { VIEW_CHOICE } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import BasicLayout from './BasicLayout.js';
import Composite from './Composite.js';
import ItemsLayout from './ItemsLayout.js';
import Select from './Select.js';
import TodoListLayout from './TodoListLayout.js';
import Toolbar from './Toolbar.js';
import TreeLayout from './TreeLayout.js';

class HomePage extends Composite {

  #screenLayout;
  #itemsInfos = [];
  #itemsLoaded;

  #itemCallsRequests;

  constructor() {
    super();

    this.#itemCallsRequests = new ItemCallsRequests();

    const viewSelect = new Select({ id: 'viewChoice', options: VIEW_CHOICE.getOptions() });
    viewSelect.setDoSelectCallback(this.displayItems.bind(this));

    const loadItemsAction = new ActionButton({ id: 'load-items-action', label: 'Rafraîchir' });
    loadItemsAction.setDoActionCallback(this.loadItems.bind(this));

    const toolbar = new Toolbar();
    toolbar.addChild(viewSelect);
    toolbar.addChild(loadItemsAction);

    this.#screenLayout = new ItemsLayout(VIEW_CHOICE.Detail);
    this.addChild(toolbar);
    this.addChild(this.#screenLayout);
  }

  /**
   * Méthode appelée lorsque le bouton est cliqué.
   * Elle met à jour le contenu de la zone de texte avec les tâches du jour.
   * @param {VIEW_CHOICE} viewChoice - Affichage souhaité
   * @this {HomePage}
   */
  displayItems(viewChoice) {
    let screenLayout;
    switch (viewChoice) {
      case VIEW_CHOICE.TodoList:
        screenLayout = new TodoListLayout();
        break;
      case VIEW_CHOICE.Tree:
        screenLayout = new TreeLayout();
        break;
      case VIEW_CHOICE.Detail:
        screenLayout = new BasicLayout();
        break;
      default:
        screenLayout = new ItemsLayout();
        break;
    }
    this.replaceChild(screenLayout, this.#screenLayout);
    this.#screenLayout = screenLayout;
    if (this.#itemsLoaded) {
      this.#screenLayout.displayItems(this.#itemsInfos);
    } else {
      this.loadItems();
    }
  }

  loadItems() {
    this.#itemCallsRequests.getAllItems()
      .then(itemsInfos => {
        this.#itemsLoaded = true;
        this.#itemsInfos = itemsInfos;
        this.#screenLayout.displayItems(itemsInfos);
        return itemsInfos;
      });
  }

}

export default HomePage;
