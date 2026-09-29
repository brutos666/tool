import { Directive, inject, input, signal } from '@angular/core';
import { Navigate } from '../components/common/Navigate.js';
import { KeyboardNavigation } from './keyboard-navigation.js';
import { Navigable } from '../components/common/Navigable.js';

@Directive({
  selector: '[tree-navigation-directive]',
  providers: [{ provide: Navigate, useExisting: TreeNavigation }],
})
export class TreeNavigation extends KeyboardNavigation {
  override name = 'TreeNavigation';
  navOrientation = input<'horizontal' | 'vertical'>('vertical');
  openState = signal<boolean>(false);

  private treeParentNav = inject(TreeNavigation, { skipSelf: true, optional: true });

  changeOpenState(open: boolean) {
    this.openState.set(open);
    if (!open) {
      this.setFocusIndex(0);
    }
  }
  isOpen(): boolean {
    return this.openState();
  }

  override interceptKeys() {
    const keys = ['Home', 'End', 'ArrowLeft', 'ArrowRight'];
    const orientation = this.navOrientation();
    if (orientation === 'vertical') {
      keys.push('ArrowUp');
      keys.push('ArrowDown');
    }
    return keys;
  }

  override onKeyDown(event: KeyboardEvent) {
    if (!this.interceptKeys().includes(event.key)) {
      return;
    }
    event.preventDefault();
    const isOpen = this.isOpen();
    if (event.key === 'Home') {
      // Laisser les composants
      return;
    } else if (event.key === 'End') {
    } else if (event.key === 'ArrowLeft') {
      if (isOpen) {
        this.changeOpenState(false);
        event.stopImmediatePropagation();
      }
    } else if (event.key === 'ArrowRight') {
      if (!isOpen) {
        this.changeOpenState(true);
        event.stopImmediatePropagation();
      }
    } else {
      const components = this.navigables;
      const done = this.goNext(components, this.focusIndex(), event.key);
      if (done) {
        event.stopImmediatePropagation();
      }
    }
  }

  goNext(components: readonly Navigable[], index: number, key: string): boolean {
    const nbItems = components.length;
    const selectedIndex = this.giveNext(index, key === 'ArrowDown' ? 'Next' : 'Previous', nbItems);
    if (selectedIndex === -1 || selectedIndex === nbItems) {
      // Désactivation si on est hors limite
      this.changeTabAccess(false);
      return false;
    }
    if (!components[selectedIndex].isFocusable()) {
      return this.goNext(components, selectedIndex, key);
    }
    this.giveFocusIndex(selectedIndex);
    return true;
  }

  override giveNext(index: number, key: string, nbItems: number): number {
    let selectedIndex = index;
    switch (key) {
      case 'Next':
        if (!this.isOpen()) {
          return nbItems;
        }
        selectedIndex++;
        break;
      case 'Previous':
        selectedIndex--;
        break;
    }
    return selectedIndex;
  }

  override changeTabAccess(access: boolean) {
    if (this.isOpen()) {
      super.changeTabAccess(access);
      return;
    }
    this.navEnabled.set(access);
    const components = this.navigables;
    components[0].changeTabAccess(access);
  }

  getRootNavigation(): TreeNavigation {
    if (this.treeParentNav) {
      return this.treeParentNav.getRootNavigation();
    }
    return this;
  }
}
