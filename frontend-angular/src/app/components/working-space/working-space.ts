import { Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { TreeList } from '../tree-list/tree-list';
import { ItemService } from '../../services/item-service.js';
import { toSignal } from '@angular/core/rxjs-interop';
import { TreeData } from '../../data/tree-data.js';
import { ItemData } from '../../data/item-data.js';
import { Layout } from '../common/Types.js';
import { RootNavigation } from '../../directives/root-navigation.js';
import { NodeElement } from '../common/NodeElement.js';
import { SpaceBody } from '../space/space-body';
import { SpaceHeader } from '../space/space-header';
import { Space } from '../space/space.js';
import { SpaceFooter } from '../space/space-footer';
import { NotificationCenter } from '../notification-center/notification-center';
import { FocusableButton } from '../action-button/focusable-button';
import { Item } from '../item/item';
import { Button } from '../action-button/button.js';
import { EnterTabNavigation } from '../../directives/enter-tab-navigation';
import { ArrowNavigation } from '../../directives/arrow-navigation';
import { Help } from '../common/HelpMessage.js';
import { DisplayPlaceHolder } from '../../directives/display-place-holder';
import { PlaceHolderService } from '../../services/place-holder-service.js';
import { WorkspaceMenuBar } from '../workspace-menu-bar/workspace-menu-bar';
import { WorkspaceMainToolbar } from '../workspace-main-toolbar/workspace-main-toolbar';

@Component({
  imports: [
    TreeList,
    Space,
    SpaceBody,
    SpaceHeader,
    SpaceFooter,
    FocusableButton,
    NotificationCenter,
    FocusableButton,
    Item,
    EnterTabNavigation,
    ArrowNavigation,
    DisplayPlaceHolder,
    WorkspaceMenuBar,
    WorkspaceMainToolbar,
  ],
  standalone: true,
  selector: 'working-space',
  styleUrl: './working-space.scss',
  templateUrl: './working-space.html',
  hostDirectives: [RootNavigation],
  host: {
    class: 'working-space',
    'aria-label': 'Espace de travail',
  },
})
export class WorkingSpace extends NodeElement implements OnDestroy {
  name = 'WorkingSpace';

  private itemService = inject(ItemService);
  placeHolderService = inject(PlaceHolderService);

  static NEW_SPACE_LABEL = 'Saisir un espace';
  static NEW_ITEM_LABEL = 'Saisir un pense-bête';

  emptyStateNav = Help.NO_TREE;
  emptyStateMain = Help.NO_TREE_SELECTED;

  rootItem = toSignal(this.itemService.rootItem$, {
    initialValue: new TreeData<ItemData>(ItemService.rootItemData),
  });
  currentItem = this.itemService.currentItemSignal;

  navLayout: Layout = Layout.Title;
  mainLayout: Layout = Layout.Todo;
  navAddButton: Button = new Button(
    'addNewSpace',
    'Ajouter un élément',
    'Ajoute un espace',
    '',
    this.doAddSpace.bind(this),
  );
  mainAddButton: Button = new Button(
    'addNewItem',
    'Ajouter un élément',
    'Ajoute une tâche à la vue courante',
    '',
    this.doAddItem.bind(this),
  );

  @ViewChild('splitter') splitterRef!: ElementRef;
  @ViewChild('navSpace', { read: ElementRef }) navSpaceRef!: ElementRef;

  private onPointerMoveEvent: Function = this.onPointerMove.bind(this);
  private onPointerUpEvent: Function = this.onPointerUp.bind(this);

  constructor() {
    super();
  }

  ngOnDestroy() {
    const splitter = this.splitterRef.nativeElement;
    splitter.removeEventListener('pointermove', this.onPointerMoveEvent);
    splitter.removeEventListener('pointerup', this.onPointerUpEvent, { once: true });
  }

  doAddSpace() {
    this.itemService.addRootItem(WorkingSpace.NEW_SPACE_LABEL);
  }
  doAddItem() {
    const currentItem = this.currentItem();
    if (currentItem) {
      this.itemService.addChildItem(currentItem, WorkingSpace.NEW_ITEM_LABEL);
    }
  }

  onPointerDown(event: PointerEvent) {
    event.preventDefault();
    const splitter = this.splitterRef.nativeElement;
    splitter.setPointerCapture(event.pointerId);
    splitter.addEventListener('pointermove', this.onPointerMoveEvent);
    splitter.addEventListener('pointerup', this.onPointerUpEvent, { once: true });
  }

  onPointerMove(event: PointerEvent) {
    const workingSpace = this.getElement();
    const navSpace = this.navSpaceRef.nativeElement;
    const offset = workingSpace.getBoundingClientRect().left;
    navSpace.style.width = `${event.clientX - offset}px`;
  }
  onPointerUp() {
    const splitter = this.splitterRef.nativeElement;
    splitter.removeEventListener('pointermove', this.onPointerMoveEvent);
  }
}
