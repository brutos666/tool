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
    this.changeTabAccess(true);
    this.giveFocus();
  }

  exit() {
    this.inside.set(false);
    this.changeTabAccess(true);
    this.giveFocus();
  }

  override isFocusable(): boolean {
    if (this.inside()) {
      return this.navigables[0].isFocusable();
    }
    const classList = this.getElement().classList;
    return !classList.contains('hidden') && !classList.contains('disabled');
  }

  override giveFocus() {
    if (this.inside()) {
      this.navigables[0].giveFocus();
    } else {
      this.getElement().focus();
    }
  }
  override isFocused(): boolean {
    if (this.inside()) {
      return this.navigables[0].isFocused();
    }
    return document.activeElement === this.getElement();
  }

  override changeTabAccess(access: boolean) {
    this.navEnabled.set(access);
    if (access) {
      const inside = this.inside();
      this.navigables[0].changeTabAccess(inside);
      this.getElement().setAttribute('tabindex', inside ? '-1' : '0');
      if (inside) {
        // Lorsque l'on entre dans un composant, le seul moyen d'en sortir doit être la touche Echap (ou la souris)
        this.getParentNavigation()?.stopNavigation();
      } else {
        this.getParentNavigation()?.startNavigation();
      }
      return;
    }
    this.inside.set(false);
    this.navigables[0].changeTabAccess(false);
    this.getElement().setAttribute('tabindex', '-1');
  }
}
