import { Component, ElementRef, inject, OnDestroy, OnInit, Signal, ViewChild } from '@angular/core';
import { MenuButton } from '../action-button/menu-button.js';
import { MenuBar } from '../menu-bar/menu-bar.js';
import { NodeElement } from '../common/NodeElement.js';
import { AsideSpace } from '../aside-space/aside-space.js';
import { TreeList } from '../tree-list/tree-list';
import { Item } from '../item/item.js';
import { ItemService } from '../../services/item-service.js';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  imports: [MenuBar, AsideSpace, TreeList, Item],
  standalone: true,
  selector: 'working-space',
  styleUrl: './working-space.scss',
  templateUrl: './working-space.html',
  host: {
    class: 'working-space',
  },
})
export class WorkingSpace extends NodeElement implements OnInit, OnDestroy {
  private itemService = inject(ItemService);

  treeItems = toSignal(this.itemService.treeItems$, { initialValue: [] });

  menuItems: Array<MenuButton> = [];
  label: String = 'Menu des commandes';

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
