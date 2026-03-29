'use strict';

import ItemCallsRequests from '../requests/ItemCallsRequests.js';
import { VIEW_CHOICE } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import Basics from './Basics.js';
import Composite from './Composite.js';
import ScreenLayout from './ScreenLayout.js';
import Select from './Select.js';
import TodoList from './TodoList.js';
import Toolbar from './Toolbar.js';

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

    this.#screenLayout = new ScreenLayout(VIEW_CHOICE.Detail);
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
        screenLayout = new TodoList();
        break;
      case VIEW_CHOICE.Detail:
        screenLayout = new Basics();
        break;
      default:
        screenLayout = new ScreenLayout();
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
