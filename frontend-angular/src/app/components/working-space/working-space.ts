import { Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { ItemService } from '../../services/item-service.js';
import { RootNavigation } from '../../directives/root-navigation.js';
import { NodeElement } from '../common/NodeElement.js';
import { NotificationCenter } from '../notification-center/notification-center';
import { ArrowNavigation } from '../../directives/arrow-navigation';
import { Help } from '../common/HelpMessage.js';
import { PlaceHolderService } from '../../services/place-holder-service.js';
import { WorkspaceMenuBar } from '../workspace-menu-bar/workspace-menu-bar';
import { WorkspaceMainToolbar } from '../workspace-main-toolbar/workspace-main-toolbar';
import { WorkspaceNav } from '../workspace-nav/workspace-nav';
import { WorkspaceTodoList } from '../workspace-todo-list/workspace-todo-list';

@Component({
  imports: [
    NotificationCenter,
    ArrowNavigation,
    WorkspaceMenuBar,
    WorkspaceMainToolbar,
    WorkspaceNav,
    WorkspaceTodoList,
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

  placeHolderService = inject(PlaceHolderService);
  private itemService = inject(ItemService);
  currentItem = this.itemService.currentItemSignal;

  emptyStateMain = Help.NO_TREE_SELECTED;

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
