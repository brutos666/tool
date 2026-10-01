import { Directive, model } from '@angular/core';
import { Navigate } from '../components/common/Navigate.js';
import { BasicNavigation } from './basic-navigation.js';
import { Navigable } from '../components/common/Navigable.js';
import { KeyboardNavigation } from './keyboard-navigation.js';

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
    if (!(navigable instanceof BasicNavigation)) {
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
    if (access) {
      this.navEnabled.set(true);
      if (this.inside()) {
        // Lorsque l'on entre dans un composant, le seul moyen d'en sortir doit être la touche Echap (ou la souris)
        // On désactive donc toute la branche de navigation courante pour n'activer que l'intérieur du composant
        this.getParentNavigation()?.stopNavigation();
        // La tabulation ne doit plus se positionner sur l'élément mais à l'intérieur
        this.getElement().setAttribute('tabindex', '-1');
        this.navigables[0].changeTabAccess(true);
      } else {
        this.getParentNavigation()?.startNavigation();
        this.getElement().setAttribute('tabindex', '0');
      }
      return;
    }
    this.navEnabled.set(false);
    this.inside.set(false);
    this.getElement().setAttribute('tabindex', '-1');
  }
}
