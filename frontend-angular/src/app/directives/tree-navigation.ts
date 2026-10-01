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
      this.giveFocusIndex(0);
    }
  }
  isOpen(): boolean {
    return this.openState();
  }
  isNode(): boolean {
    return this.navigables.length > 1;
  }
  isOnChildNode(): boolean {
    return this.getFocusIndex() > 0;
  }

  override interceptKeys() {
    const keys = ['ArrowLeft', 'ArrowRight'];
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
    if (event.key === 'ArrowLeft') {
      if (isOpen) {
        if (this.isOnChildNode()) {
          this.giveFocusIndex(0);
        } else {
          this.changeOpenState(false);
        }
        event.stopImmediatePropagation();
      }
    } else if (event.key === 'ArrowRight') {
      if (isOpen) {
        if (!this.isOnChildNode()) {
          this.goNext(this.navigables, 0, 'Next');
          event.stopImmediatePropagation();
        }
      } else if (this.isNode()) {
        this.changeOpenState(true);
        event.stopImmediatePropagation();
      }
    } else {
      const key = event.key === 'ArrowDown' ? 'Next' : 'Previous';
      const done = this.goNext(this.navigables, this.getFocusIndex(), key);
      if (done) {
        event.stopImmediatePropagation();
      }
    }
  }

  override goNext(components: readonly Navigable[], index: number, key: string): boolean {
    const nextIndex = this.getNextIndex(components, index, key);
    if (nextIndex === -1) {
      // Désactivation si on est en dehors des limites
      this.changeTabAccess(false);
      return false;
    }
    if (key === 'Previous') {
      this.getTreeChildNav(nextIndex)?.setCurrentLast();
    } else {
      this.getTreeChildNav(nextIndex)?.setCurrentIndex(0);
    }
    this.giveFocusIndex(nextIndex);
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

  setCurrentLast() {
    if (!this.isOpen()) {
      this.setCurrentIndex(0);
      return;
    }
    const components = this.navigables;
    const nbItems = components.length;
    // Astuce pour trouver le dernier accessible à partir de la fin
    const nextIndex = this.getNextIndex(components, nbItems, 'Previous');
    if (nextIndex === -1) {
      return;
    }
    const treeNav = this.getTreeChildNav(nextIndex);
    if (treeNav) {
      treeNav.setCurrentLast();
    }
    this.setCurrentIndex(nextIndex);
  }

  override isFocusable(): boolean {
    if (this.isOpen()) {
      return super.isFocusable();
    }
    return this.navigables[0].isFocusable();
  }

  getRootNavigation(): TreeNavigation {
    if (this.treeParentNav) {
      return this.treeParentNav.getRootNavigation();
    }
    return this;
  }

  getTreeChildNav(index: number): TreeNavigation | undefined {
    return this.getTreeChildrenNav()[index - 1];
  }
  getTreeChildrenNav(): TreeNavigation[] {
    return this.navigables.filter((navigable) => navigable instanceof TreeNavigation);
  }
}
