import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { MenuButton } from '../action-button/menu-button.js';
import { Menu } from '../menu/menu.js';
import { NodeElement } from '../common/NodeElement.js';
import { AsideSpace } from '../aside-space/aside-space.js';
import { ItemData } from '../../data/item-data.js';
import { TreeData } from '../../data/tree-data.js';
import { TreeList } from '../tree-list/tree-list';
import { Item } from '../item/item.js';

@Component({
  imports: [Menu, AsideSpace, TreeList, Item],
  standalone: true,
  selector: 'app-working-space',
  styleUrl: './working-space.scss',
  templateUrl: './working-space.html',
  host: {
    class: 'working-space',
  },
})
export class WorkingSpace extends NodeElement implements OnDestroy {
  menuItems: Array<MenuButton> = [];
  label: String = 'Menu des commandes';
  treeItems: Array<TreeData<ItemData>> = [];

  @ViewChild('splitter') splitterRef!: ElementRef;
  @ViewChild('navSpace') navSpaceRef!: ElementRef;

  private onPointerMoveEvent: Function = this.onPointerMove.bind(this);
  private onPointerUpEvent: Function = this.onPointerUp.bind(this);

  constructor() {
    super();
    this.menuItems.push(new MenuButton('Actualiser'));
    this.menuItems.push(new MenuButton('Sauvegarder tout'));
    this.menuItems.push(new MenuButton('Sauvegarder la vue courante'));
    this.menuItems.push(new MenuButton('Exporter tout'));
    this.menuItems.push(new MenuButton('Importer'));

    const treeItem = new TreeData(this.createItem('1', 'Parent 1'));
    treeItem.addChild(new TreeData(this.createItem('1-1', 'Enfant 1')));
    treeItem.addChild(new TreeData(this.createItem('1-2', 'Enfant 2')));
    this.treeItems.push(treeItem);
    const treeItem2 = new TreeData(this.createItem('2', 'Parent 2'));
    const treeItem2_1 = new TreeData(this.createItem('2-1', 'Enfant 1 de 2'));
    treeItem2.addChild(treeItem2_1);
    treeItem2.addChild(new TreeData(this.createItem('2-2', 'Enfant 2 de 2')));
    const treeItem2_1_1 = new TreeData(this.createItem('2-1-1', 'Enfant 1 de 2-1'));
    treeItem2_1.addChild(treeItem2_1_1);
    this.treeItems.push(treeItem2);
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

  ngOnDestroy() {
    const splitter = this.splitterRef.nativeElement;
    splitter.removeEventListener('pointermove', this.onPointerMoveEvent);
    splitter.removeEventListener('pointerup', this.onPointerUpEvent, { once: true });
  }

  createItem(id: string, title: string): ItemData {
    return new ItemData(id, title, '', 'TODO', 'OK');
  }
}
