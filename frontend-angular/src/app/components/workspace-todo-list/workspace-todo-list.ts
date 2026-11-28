import { Component, inject, input } from '@angular/core';
import { Space } from '../space/space';
import { SpaceHeader } from '../space/space-header';
import { EnterTabNavigation } from '../../directives/enter-tab-navigation';
import { Item } from '../item/item';
import { SpaceBody } from '../space/space-body';
import { TreeList } from '../tree-list/tree-list';
import { DisplayPlaceHolder } from '../../directives/display-place-holder';
import { SpaceFooter } from '../space/space-footer';
import { FocusableButton } from '../action-button/focusable-button';
import { Layout } from '../common/Types.js';
import { Button } from '../action-button/button.js';
import { ItemService } from '../../services/item-service.js';
import { PlaceHolderService } from '../../services/place-holder-service.js';
import { TreeData } from '../../data/tree-data.js';
import { ItemData } from '../../data/item-data.js';

@Component({
  imports: [
    Space,
    SpaceHeader,
    EnterTabNavigation,
    Item,
    SpaceBody,
    TreeList,
    DisplayPlaceHolder,
    SpaceFooter,
    FocusableButton,
  ],
  selector: 'workspace-todo-list',
  styleUrl: './workspace-todo-list.scss',
  templateUrl: './workspace-todo-list.html',
})
export class WorkspaceTodoList {
  placeHolderService = inject(PlaceHolderService);
  private itemService = inject(ItemService);
  static NEW_ITEM_LABEL = 'Saisir un pense-bête';

  private currentItem = this.itemService.currentItemSignal;

  treeData = input.required<TreeData<ItemData>>();

  mainLayout: Layout = Layout.Todo;
  mainAddButton: Button = new Button(
    'addNewItem',
    'Ajouter un élément',
    'Ajoute une tâche à la vue courante',
    '',
    this.doAddItem.bind(this),
  );

  doAddItem() {
    const currentItem = this.currentItem();
    if (currentItem) {
      this.itemService.addChildItem(currentItem, WorkspaceTodoList.NEW_ITEM_LABEL);
    }
  }
}
