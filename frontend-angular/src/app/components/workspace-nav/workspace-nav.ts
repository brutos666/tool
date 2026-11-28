import { Component, inject } from '@angular/core';
import { PlaceHolderService } from '../../services/place-holder-service.js';
import { Space } from '../space/space';
import { SpaceHeader } from '../space/space-header';
import { SpaceBody } from '../space/space-body';
import { TreeList } from '../tree-list/tree-list';
import { SpaceFooter } from '../space/space-footer';
import { DisplayPlaceHolder } from '../../directives/display-place-holder';
import { Button } from '../action-button/button.js';
import { Layout } from '../common/Types.js';
import { Help } from '../common/HelpMessage.js';
import { ItemService } from '../../services/item-service.js';
import { FocusableButton } from '../action-button/focusable-button';
import { toSignal } from '@angular/core/rxjs-interop';
import { TreeData } from '../../data/tree-data.js';
import { ItemData } from '../../data/item-data.js';

@Component({
  imports: [
    Space,
    SpaceHeader,
    SpaceBody,
    TreeList,
    SpaceFooter,
    DisplayPlaceHolder,
    FocusableButton,
  ],
  selector: 'workspace-nav',
  styleUrl: './workspace-nav.scss',
  templateUrl: './workspace-nav.html',
})
export class WorkspaceNav {
  placeHolderService = inject(PlaceHolderService);
  private itemService = inject(ItemService);

  rootItem = toSignal(this.itemService.rootItem$, {
    initialValue: new TreeData<ItemData>(ItemService.rootItemData),
  });

  static NEW_SPACE_LABEL = 'Saisir un espace';

  navLayout: Layout = Layout.Title;
  emptyStateNav = Help.NO_TREE;

  navAddButton: Button = new Button(
    'addNewSpace',
    'Ajouter un élément',
    'Ajoute un espace',
    '',
    this.doAddSpace.bind(this),
  );

  doAddSpace() {
    this.itemService.addRootItem(WorkspaceNav.NEW_SPACE_LABEL);
  }
}
