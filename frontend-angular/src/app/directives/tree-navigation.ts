import { Directive, input, signal } from '@angular/core';
import { Navigate } from '../components/common/Navigate.js';
import { MoveNavigation } from './move-navigation.js';
import { Navigable } from '../components/common/Navigable.js';

@Directive({
  selector: '[tree-navigation-directive]',
  providers: [{ provide: Navigate, useExisting: TreeNavigation }],
})
export class TreeNavigation extends MoveNavigation {
  override name = 'TreeNavigation';
  navOrientation = input<'horizontal' | 'vertical'>('vertical');
  openState = signal<boolean>(false);

  changeOpenState(open: boolean) {
    this.openState.set(open);
    if (!open) {
      this.setFocusIndex(0);
    }
  }
  openNode() {
    this.changeOpenState(true);
  }
  closeNode() {
    this.changeOpenState(false);
  }
  isClosed(): boolean {
    return !this.openState();
  }
  isLeaf(): boolean {
    return this.navigables.length === 1;
  }
  isOnNode(): boolean {
    return this.getFocusIndex() === 0;
  }
  getNode(): Navigable {
    return this.navigables[0];
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

  override moveToDirection(key: string): boolean {
    if (['ArrowUp', 'ArrowDown'].includes(key)) {
      return super.moveToDirection(key === 'ArrowDown' ? 'Next' : 'Previous');
    }
    // Gauche/Droite
    if (this.isLeaf()) {
      return false;
    }
    if (this.isClosed()) {
      if (key === 'ArrowRight') {
        this.openNode();
        return true;
      }
      return false; // noeud fermé, direction vers la gauche
    }
    // Noeud ouvert
    if (key === 'ArrowLeft') {
      if (this.isOnNode()) {
        this.closeNode();
      } else {
        this.goOnNode();
      }
      return true;
    }
    // Ouvert, direction vers la droite
    if (this.isOnNode()) {
      return this.goOnFirstTree();
    }
    return false;
  }
  goOnNode() {
    this.giveFocusIndex(0);
  }
  goOnFirstTree(): boolean {
    // Recherche du 1er focusable après 0
    const nextIndex = this.getNextIndex(this.navigables, 0, 'Next');
    if (nextIndex > -1) {
      this.moveToIndex('Next', nextIndex);
      return true;
    }
    return false;
  }

  override moveToIndex(key: string, index: number) {
    // IMPORTANT : Désactiver la prise de focus courante. On doit le faire avant les modifications d'index dans l'arbre
    this.navigables[this.getFocusIndex()].changeTabAccess(false);
    // Modification des index dans l'arbre avant de le rendre courant
    if (key === 'Next') {
      this.getTreeChildNav(index)?.setCurrentIndex(0);
    } else {
      this.getTreeChildNav(index)?.setCurrentLast();
    }
    // Prise de focus
    this.giveFocusIndex(index);
  }

  override giveNext(index: number, direction: string, nbItems: number): number {
    if (direction === 'Next' && this.isClosed()) {
      return nbItems;
    }
    return super.giveNext(index, direction, nbItems);
  }

  /** Positionne sur la dernière feuille de la dernière branche du dernier arbre */
  setCurrentLast() {
    if (this.isClosed() || this.isLeaf()) {
      this.setCurrentIndex(0);
      return;
    }
    const components = this.navigables;
    // Astuce pour trouver le dernier accessible à partir de la fin
    const nextIndex = this.getNextIndex(components, components.length, 'Previous');
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
    if (this.isClosed()) {
      return this.getNode().isFocusable();
    }
    return super.isFocusable();
  }

  getTreeChildNav(index: number): TreeNavigation | undefined {
    return this.getTreeChildrenNav()[index - 1];
  }
  getTreeChildrenNav(): TreeNavigation[] {
    return this.navigables.slice(1).map((navigable) => navigable as TreeNavigation);
  }
}
