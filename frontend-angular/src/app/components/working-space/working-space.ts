import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MenuButton } from '../action-button/menu-button.js';
import { MenuBar } from '../menu-bar/menu-bar.js';
import { AsideSpace } from '../aside-space/aside-space.js';
import { TreeList } from '../tree-list/tree-list';
import { ItemService } from '../../services/item-service.js';
import { toSignal } from '@angular/core/rxjs-interop';
import { TreeData } from '../../data/tree-data.js';
import { ItemData } from '../../data/item-data.js';
import { Layout } from '../common/Types.js';
import { RootNavigation } from '../../directives/root-navigation.js';
import { NodeElement } from '../common/NodeElement.js';

@Component({
  imports: [MenuBar, AsideSpace, TreeList],
  standalone: true,
  selector: 'working-space',
  styleUrl: './working-space.scss',
  templateUrl: './working-space.html',
  hostDirectives: [RootNavigation],
  host: {
    class: 'working-space',
  },
})
export class WorkingSpace extends NodeElement implements OnInit, OnDestroy {
  name = 'WorkingSpace';

  private itemService = inject(ItemService);

  rootItem = toSignal(this.itemService.rootItem$, {
    initialValue: new TreeData<ItemData>(ItemService.rootItemData),
  });

  menuItems: Array<MenuButton> = [];
  label: String = 'Menu des commandes';
  navLayout: Layout = Layout.Title;
  mainLayout: Layout = Layout.Todo;

  @ViewChild('splitter') splitterRef!: ElementRef;
  @ViewChild('navSpace', { read: ElementRef }) navSpaceRef!: ElementRef;

  private onPointerMoveEvent: Function = this.onPointerMove.bind(this);
  private onPointerUpEvent: Function = this.onPointerUp.bind(this);

  ngOnInit(): void {
    this.menuItems.push(new MenuButton('reload', 'Actualiser', this.onReloadClick.bind(this)));
    this.menuItems.push(new MenuButton('saveAll', 'Sauvegarder tout'));
    this.menuItems.push(new MenuButton('save', 'Sauvegarder la vue courante'));
    this.menuItems.push(new MenuButton('exportAll', 'Exporter tout'));
    this.menuItems.push(new MenuButton('import', 'Importer'));
  }

  ngOnDestroy() {
    const splitter = this.splitterRef.nativeElement;
    splitter.removeEventListener('pointermove', this.onPointerMoveEvent);
    splitter.removeEventListener('pointerup', this.onPointerUpEvent, { once: true });
  }

  onReloadClick() {
    this.itemService.loadItems();
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
