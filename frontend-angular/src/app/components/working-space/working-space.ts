import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { MenuButton } from '../action-button/menu-button.js';
import { Menu } from '../menu/menu.js';
import { NodeElement } from '../common/NodeElement.js';
import { AsideSpace } from '../aside-space/aside-space.js';

@Component({
  imports: [Menu, AsideSpace],
  standalone: true,
  selector: 'app-working-space',
  styleUrl: './working-space.scss',
  templateUrl: './working-space.html',
  host: {
    class:"working-space",
  }
})
export class WorkingSpace extends NodeElement implements OnDestroy {
  menuItems: Array<MenuButton> = [];
  label:String = 'Menu des commandes';

  @ViewChild('splitter') splitterRef!: ElementRef;
  @ViewChild('navSpace') navSpaceRef!: ElementRef;

  private onPointerMoveEvent:Function = this.onPointerMove.bind(this);
  private onPointerUpEvent:Function = this.onPointerUp.bind(this);

  constructor() {
    super();
    this.menuItems.push(new MenuButton('Actualiser'));
    this.menuItems.push(new MenuButton('Sauvegarder tout'));
    this.menuItems.push(new MenuButton('Sauvegarder la vue courante'));
    this.menuItems.push(new MenuButton('Exporter tout'));
    this.menuItems.push(new MenuButton('Importer'));
  }

  onPointerDown(event:PointerEvent) {
    event.preventDefault();
    const splitter = this.splitterRef.nativeElement;
    splitter.setPointerCapture(event.pointerId);
    splitter.addEventListener('pointermove', this.onPointerMoveEvent);
    splitter.addEventListener('pointerup', this.onPointerUpEvent, { once: true });
  }

  onPointerMove(event:PointerEvent) {
    const workingSpace = this.getElement();
    const navSpace = this.navSpaceRef.nativeElement;
    const offset = workingSpace.getBoundingClientRect().left;
    navSpace.style.width = `${ event.clientX - offset }px`;
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
}
