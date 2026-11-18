import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MenuBar } from '../menu-bar/menu-bar.js';
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
import { Toolbar } from '../toolbar/toolbar';
import { Button } from '../action-button/button.js';
import { EnterTabNavigation } from '../../directives/enter-tab-navigation';
import { ArrowNavigation } from '../../directives/arrow-navigation';
import { Help } from '../common/HelpMessage.js';

@Component({
  imports: [
    MenuBar,
    TreeList,
    Space,
    SpaceBody,
    SpaceHeader,
    SpaceFooter,
    FocusableButton,
    NotificationCenter,
    FocusableButton,
    Item,
    Toolbar,
    EnterTabNavigation,
    ArrowNavigation,
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
export class WorkingSpace extends NodeElement implements OnInit, OnDestroy {
  name = 'WorkingSpace';

  private itemService = inject(ItemService);

  static NEW_SPACE_LABEL = 'Saisir un espace';
  static NEW_ITEM_LABEL = 'Saisir un pense-bête';

  emptyStateNav = Help.NO_TREE;
  emptyStateMain = Help.NO_TREE_SELECTED;

  rootItem = toSignal(this.itemService.rootItem$, {
    initialValue: new TreeData<ItemData>(ItemService.rootItemData),
  });
  currentItem = this.itemService.currentItemSignal;

  menuItems: Array<Button> = [];
  mainButtons: Array<Button> = [];
  label: string = 'Menu des commandes';
  navLayout: Layout = Layout.Title;
  mainLayout: Layout = Layout.Todo;
  navAddButton: Button = new Button(
    'addNewSpace',
    'Ajouter un élément',
    '',
    this.doAddSpace.bind(this),
  );
  mainLabel: string = 'Menu des commandes de la vue';
  mainAddButton: Button = new Button(
    'addNewItem',
    'Ajouter un élément',
    '',
    this.doAddItem.bind(this),
  );

  @ViewChild('splitter') splitterRef!: ElementRef;
  @ViewChild('navSpace', { read: ElementRef }) navSpaceRef!: ElementRef;

  private onPointerMoveEvent: Function = this.onPointerMove.bind(this);
  private onPointerUpEvent: Function = this.onPointerUp.bind(this);

  ngOnInit(): void {
    this.menuItems.push(
      new Button('reload', 'Actualiser', 'rotate-right', this.loadAll.bind(this)),
    );
    this.menuItems.push(new Button('saveAll', 'Sauvegarder tout', 'save', this.saveAll.bind(this)));
    this.menuItems.push(
      new Button('exportAll', 'Exporter tout', 'upload', this.exportAll.bind(this)),
    );
    this.menuItems.push(new Button('import', 'Importer', '', this.import.bind(this)));

    const vue = 'la vue courante';
    this.mainButtons.push(
      new Button('reloadCurrent', `Actualiser ${vue}`, 'rotate-right', this.loadCurrent.bind(this)),
    );
    this.mainButtons.push(
      new Button('saveCurrent', `Sauvegarder ${vue}`, 'save', this.saveCurrent.bind(this)),
    );
    this.mainButtons.push(
      new Button('uploadCurrent', `Exporter ${vue}`, 'upload', this.exportCurrent.bind(this)),
    );
  }

  ngOnDestroy() {
    const splitter = this.splitterRef.nativeElement;
    splitter.removeEventListener('pointermove', this.onPointerMoveEvent);
    splitter.removeEventListener('pointerup', this.onPointerUpEvent, { once: true });
  }

  loadAll() {
    this.itemService.loadItems();
  }
  loadCurrent() {
    this.itemService.loadCurrentItem();
  }
  saveAll() {
    this.itemService.saveAllItems();
  }
  saveCurrent() {
    this.itemService.saveCurrentItem();
  }
  exportAll() {
    this.itemService.exportAllItems();
  }
  exportCurrent() {
    this.itemService.exportCurrentItem();
  }
  import() {}

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
