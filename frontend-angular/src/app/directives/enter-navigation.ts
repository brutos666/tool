import { Directive, model } from '@angular/core';
import { Navigate } from '../components/common/Navigate.js';
import { Navigable } from '../components/common/Navigable.js';
import { KeyboardNavigation } from './keyboard-navigation.js';
import { ManualNavigation } from './manual-navigation.js';

@Directive({
  selector: '[enter-directive]',
  providers: [
    { provide: Navigable, useExisting: EnterNavigation },
    { provide: Navigate, useExisting: EnterNavigation },
  ],
  host: {
    '[class]': 'inside() ? "inside" : "outside"',
  },
})
export class EnterNavigation extends KeyboardNavigation {
  override name = 'EnterNavigation';

  inside = model<boolean>(false);

  override registerChild(navigable: Navigable): void {
    if (!(navigable instanceof ManualNavigation)) {
      return;
    }
    super.registerChild(navigable);
  }
  override unregisterChild(navigable: Navigable) {
    if (this.inside()) {
      this.inside.set(false);
      this.getParentNavigation()?.startNavigation();
    }
    super.unregisterChild(navigable);
  }

  override onMouseDown(event: MouseEvent) {
    this.inside.set(true);
    this.containFocus = true;
  }

  override interceptKeys() {
    return [this.inside() ? 'Escape' : 'Enter'];
  }
  override onKeyDown(event: KeyboardEvent) {
    if (!this.interceptKeys().includes(event.key)) {
      return;
    }
    event.preventDefault();
    if (event.key === 'Enter') {
      this.enter();
    } else if (event.key === 'Escape') {
      this.exit();
    }
  }

  enter() {
    this.inside.set(true);
    this.applyAccessInside();
    this.giveFocus();
  }

  exit() {
    this.inside.set(false);
    this.applyAccessOutside();
    this.giveFocus();
  }

  override isFocusable(): boolean {
    if (this.inside()) {
      return this.getInside().isFocusable();
    }
    const classList = this.getElement().classList;
    return !classList.contains('hidden') && !classList.contains('disabled');
  }

  override giveFocus() {
    if (this.inside()) {
      this.getInside().giveFocus();
    } else {
      this.getElement().focus();
    }
  }
  override isFocused(): boolean {
    if (this.inside()) {
      return this.getInside().isFocused();
    }
    return document.activeElement === this.getElement();
  }

  override changeTabAccess(access: boolean): void {
    if (!access) {
      this.inside.set(false);
    }
    super.changeTabAccess(access);
  }

  override applyTabAccess() {
    if (!this.hasInside()) {
      return;
    }
    if (this.inside()) {
      this.applyAccessInside();
      return;
    }
    if (this.accessible) {
      this.applyAccessOutside();
      return;
    }
    this.getInside().changeTabAccess(false);
    this.getElement().setAttribute('tabindex', '-1');
  }

  private applyAccessInside() {
    this.getElement().setAttribute('tabindex', '-1');
    this.getInside().changeTabAccess(true);
    // Lorsque l'on entre dans un composant, le seul moyen d'en sortir doit être la touche Echap (ou la souris)
    this.getParentNavigation()?.stopNavigation();
  }

  private applyAccessOutside() {
    this.getElement().setAttribute('tabindex', '0');
    this.getInside().changeTabAccess(false);
    this.getParentNavigation()?.startNavigation();
  }

  private getInside(): Navigable {
    return this.navigables[0];
  }
  private hasInside(): boolean {
    return this.navigables.length > 0;
  }
}
